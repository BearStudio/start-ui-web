import { Result } from '@swan-io/boxed';
import { and, asc, desc, eq, sql } from 'drizzle-orm';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { SessionId, UserId } from '@/modules/kernel/domain/ids';
import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import {
  getConstraintName,
  isUniqueConstraintViolation,
} from '@/modules/kernel/infrastructure/db/errors';
import { observeRepository } from '@/modules/kernel/infrastructure/db/observability';
import {
  ascendingTextCursorFilter,
  descendingDateCursorFilter,
  escapedIlikeFilter,
  takeCursorPage,
} from '@/modules/kernel/infrastructure/db/query-helpers';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';
import type {
  User,
  UserCreateInput,
  UserRepository,
  UserSession,
  UserUpdatePersistenceInput,
} from '@/modules/user';

import { session as sessionTable, user as userTable } from './schema';

function toDomainUser(row: typeof userTable.$inferSelect): User {
  return {
    id: toUserId(row.id),
    name: row.name,
    email: toEmailAddress(row.email),
    emailVerified: row.emailVerified,
    role: row.role,
    image: row.image,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    onboardedAt: row.onboardedAt,
  };
}

function toDomainSession(
  row: Pick<
    typeof sessionTable.$inferSelect,
    'id' | 'createdAt' | 'updatedAt' | 'expiresAt' | 'ipAddress' | 'userAgent'
  >
): UserSession {
  return {
    id: toSessionId(row.id),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    expiresAt: row.expiresAt,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
  };
}

function isUserDuplicateError(error: unknown) {
  return (
    isUniqueConstraintViolation(error) &&
    getConstraintName(error) === 'user_email_key'
  );
}

function mapDbError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isUserDuplicateError(error)) {
    return new AppError({
      code: 'USER_DUPLICATE',
      category: 'conflict',
      status: 409,
      message: 'User already exists',
      details: { target: ['email'] },
      cause: error,
    });
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (code === '23503') {
      return new AppError({
        code: 'USER_FOREIGN_KEY',
        category: 'bad_request',
        status: 400,
        message: 'Invalid user relationship',
        cause: error,
      });
    }
  }

  return new AppError({
    code: 'USER_REPOSITORY_ERROR',
    category: 'system',
    status: 500,
    message: 'User repository error',
    cause: error,
  });
}

export class UserRepositoryDrizzle implements UserRepository {
  constructor(private readonly db: DbLike) {}

  async list(input: {
    cursor?: UserId;
    limit: number;
    searchTerm: string;
  }): ReturnType<UserRepository['list']> {
    try {
      const searchFilter = escapedIlikeFilter(
        [userTable.name, userTable.email],
        input.searchTerm
      );

      const cursorRow = input.cursor
        ? await this.db.query.user.findFirst({
            where: eq(userTable.id, input.cursor),
            columns: { id: true, name: true },
          })
        : undefined;

      if (input.cursor && !cursorRow) {
        const [totalResult] = await this.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(userTable)
          .where(searchFilter);

        return Result.Ok({
          type: 'user_listed',
          page: {
            items: [],
            nextCursor: undefined,
            total: totalResult?.count ?? 0,
          },
        });
      }

      const cursorFilter = ascendingTextCursorFilter({
        sortColumn: userTable.name,
        idColumn: userTable.id,
        cursor: cursorRow
          ? { id: cursorRow.id, sortValue: cursorRow.name }
          : undefined,
      });

      const where = and(searchFilter, cursorFilter);

      const [total, rows] = await Promise.all([
        this.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(userTable)
          .where(searchFilter),
        this.db.query.user.findMany({
          where,
          orderBy: [asc(userTable.name), asc(userTable.id)],
          limit: input.limit + 1,
        }),
      ]);

      const { pageRows, nextCursor } = takeCursorPage(
        rows,
        input.limit,
        (row) => toUserId(row.id)
      );

      return Result.Ok({
        type: 'user_listed',
        page: {
          items: pageRows.map(toDomainUser),
          nextCursor,
          total: total[0]?.count ?? 0,
        },
      });
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }

  async getById(id: UserId): ReturnType<UserRepository['getById']> {
    try {
      const row = await this.db.query.user.findFirst({
        where: eq(userTable.id, id),
      });
      return Result.Ok(
        row
          ? { type: 'user_found', user: toDomainUser(row) }
          : { type: 'user_not_found' }
      );
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }

  async create(input: UserCreateInput): ReturnType<UserRepository['create']> {
    try {
      const [created] = await this.db
        .insert(userTable)
        .values({
          email: input.email,
          emailVerified: true,
          name: input.name ?? '',
          role: input.role ?? 'user',
        })
        .returning();

      if (!created) {
        return Result.Error(
          new AppError({
            code: 'USER_CREATE_EMPTY_RESULT',
            category: 'system',
            status: 500,
            message: 'User create returned no row',
          })
        );
      }

      return Result.Ok({ type: 'user_created', user: toDomainUser(created) });
    } catch (error) {
      if (isUserDuplicateError(error))
        return Result.Ok({ type: 'user_duplicate' });
      return Result.Error(mapDbError(error));
    }
  }

  async getUpdateSnapshot(
    id: UserId
  ): ReturnType<UserRepository['getUpdateSnapshot']> {
    try {
      const row = await this.db.query.user.findFirst({
        where: eq(userTable.id, id),
        columns: { email: true, role: true },
      });
      return Result.Ok(
        row
          ? {
              type: 'user_update_snapshot_found',
              snapshot: { email: toEmailAddress(row.email), role: row.role },
            }
          : { type: 'user_not_found' }
      );
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }

  async update(
    id: UserId,
    input: UserUpdatePersistenceInput
  ): ReturnType<UserRepository['update']> {
    try {
      const [updated] = await this.db
        .update(userTable)
        .set({
          name: input.name,
          role: input.role,
          email: input.email,
          emailVerified: input.emailVerified,
        })
        .where(eq(userTable.id, id))
        .returning();

      return Result.Ok(
        updated
          ? { type: 'user_updated', user: toDomainUser(updated) }
          : { type: 'user_not_found' }
      );
    } catch (error) {
      if (isUserDuplicateError(error))
        return Result.Ok({ type: 'user_duplicate' });
      return Result.Error(mapDbError(error));
    }
  }

  async listSessions(input: {
    userId: UserId;
    cursor?: SessionId;
    limit: number;
  }): ReturnType<UserRepository['listSessions']> {
    try {
      const userIdFilter = eq(sessionTable.userId, input.userId);

      const cursorRow = input.cursor
        ? await this.db.query.session.findFirst({
            where: and(
              eq(sessionTable.id, input.cursor),
              eq(sessionTable.userId, input.userId)
            ),
            columns: { id: true, createdAt: true },
          })
        : undefined;

      if (input.cursor && !cursorRow) {
        const [totalResult] = await this.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(sessionTable)
          .where(userIdFilter);

        return Result.Ok({
          type: 'user_sessions_listed',
          page: {
            items: [],
            nextCursor: undefined,
            total: totalResult?.count ?? 0,
          },
        });
      }

      const cursorFilter = descendingDateCursorFilter({
        sortColumn: sessionTable.createdAt,
        idColumn: sessionTable.id,
        cursor: cursorRow
          ? { id: cursorRow.id, sortValue: cursorRow.createdAt }
          : undefined,
      });

      const where = and(userIdFilter, cursorFilter);

      const [total, rows] = await Promise.all([
        this.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(sessionTable)
          .where(userIdFilter),
        this.db.query.session.findMany({
          where,
          columns: {
            id: true,
            createdAt: true,
            updatedAt: true,
            expiresAt: true,
            ipAddress: true,
            userAgent: true,
          },
          orderBy: [desc(sessionTable.createdAt), asc(sessionTable.id)],
          limit: input.limit + 1,
        }),
      ]);

      const { pageRows, nextCursor } = takeCursorPage(
        rows,
        input.limit,
        (row) => toSessionId(row.id)
      );

      return Result.Ok({
        type: 'user_sessions_listed',
        page: {
          items: pageRows.map(toDomainSession),
          nextCursor,
          total: total[0]?.count ?? 0,
        },
      });
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }

  async findSessionForRevocation(input: {
    userId: UserId;
    sessionId: SessionId;
  }): ReturnType<UserRepository['findSessionForRevocation']> {
    try {
      const row = await this.db.query.session.findFirst({
        where: and(
          eq(sessionTable.id, input.sessionId),
          eq(sessionTable.userId, input.userId)
        ),
        columns: { id: true },
      });

      return Result.Ok(
        row
          ? {
              type: 'user_session_revocation_target_found',
              target: { id: toSessionId(row.id) },
            }
          : { type: 'user_session_not_found' }
      );
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }
}

export interface UserRepositoryDrizzleDependencies {
  db: DbLike;
}

export function createUserRepository(
  dependencies: UserRepositoryDrizzleDependencies
): UserRepository {
  return observeRepository(new UserRepositoryDrizzle(dependencies.db), 'user');
}
