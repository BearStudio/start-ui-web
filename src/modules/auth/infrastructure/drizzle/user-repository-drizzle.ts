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
import {
  ascendingTextCursorFilter,
  descendingDateCursorFilter,
  escapedIlikeFilter,
  takeCursorPage,
} from '@/modules/kernel/infrastructure/db/query-helpers';
import { session as sessionTable, user as userTable } from './schema';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';

import type {
  SessionRevocationTarget,
  User,
  UserCreateInput,
  UserListPage,
  UserSession,
  UserSessionListPage,
  UserUpdatePersistenceInput,
  UserUpdateSnapshot,
  UserRepository,
} from '@/modules/user';

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

function mapDbError(error: unknown): never {
  if (
    isUniqueConstraintViolation(error) &&
    getConstraintName(error) === 'user_email_key'
  ) {
    throw new AppError({
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
      throw new AppError({
        code: 'USER_FOREIGN_KEY',
        category: 'bad_request',
        status: 400,
        message: 'Invalid user relationship',
        cause: error,
      });
    }
  }

  throw new AppError({
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
  }): Promise<UserListPage> {
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

        return {
          items: [],
          nextCursor: undefined,
          total: totalResult?.count ?? 0,
        };
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

      return {
        items: pageRows.map(toDomainUser),
        nextCursor,
        total: total[0]?.count ?? 0,
      };
    } catch (error) {
      mapDbError(error);
    }
  }

  async getById(id: UserId): Promise<User | null> {
    try {
      const row = await this.db.query.user.findFirst({
        where: eq(userTable.id, id),
      });
      return row ? toDomainUser(row) : null;
    } catch (error) {
      mapDbError(error);
    }
  }

  async create(input: UserCreateInput): Promise<User> {
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
        throw new AppError({
          code: 'USER_CREATE_EMPTY_RESULT',
          category: 'system',
          status: 500,
          message: 'User create returned no row',
        });
      }

      return toDomainUser(created);
    } catch (error) {
      if (error instanceof AppError) throw error;
      mapDbError(error);
    }
  }

  async getUpdateSnapshot(id: UserId): Promise<UserUpdateSnapshot | null> {
    try {
      const row = await this.db.query.user.findFirst({
        where: eq(userTable.id, id),
        columns: { email: true, role: true },
      });
      return row ? { email: toEmailAddress(row.email), role: row.role } : null;
    } catch (error) {
      mapDbError(error);
    }
  }

  async update(
    id: UserId,
    input: UserUpdatePersistenceInput
  ): Promise<User | null> {
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

      return updated ? toDomainUser(updated) : null;
    } catch (error) {
      mapDbError(error);
    }
  }

  async listSessions(input: {
    userId: UserId;
    cursor?: SessionId;
    limit: number;
  }): Promise<UserSessionListPage> {
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

        return {
          items: [],
          nextCursor: undefined,
          total: totalResult?.count ?? 0,
        };
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

      return {
        items: pageRows.map(toDomainSession),
        nextCursor,
        total: total[0]?.count ?? 0,
      };
    } catch (error) {
      mapDbError(error);
    }
  }

  async findSessionForRevocation(input: {
    userId: UserId;
    sessionId: SessionId;
  }): Promise<SessionRevocationTarget | null> {
    try {
      const row = await this.db.query.session.findFirst({
        where: and(
          eq(sessionTable.id, input.sessionId),
          eq(sessionTable.userId, input.userId)
        ),
        columns: { id: true },
      });

      return row ? { id: toSessionId(row.id) } : null;
    } catch (error) {
      mapDbError(error);
    }
  }
}
