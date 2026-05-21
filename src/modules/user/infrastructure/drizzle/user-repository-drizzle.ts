import { and, asc, desc, eq, gt, ilike, lt, or, sql } from 'drizzle-orm';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { SessionId, UserId } from '@/modules/kernel/domain/ids';
import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import type { Database } from '@/modules/kernel/infrastructure/db/client';
import { isPgError } from '@/modules/kernel/infrastructure/db/errors';
import { escapeLikePattern } from '@/modules/kernel/infrastructure/db/like';
import {
  session as sessionTable,
  user as userTable,
} from '@/modules/kernel/infrastructure/db/schema';

import type { UserRepository } from '../../application/ports/user-repository';
import type {
  SessionRevocationTarget,
  User,
  UserCreateInput,
  UserListPage,
  UserRole,
  UserSession,
  UserSessionListPage,
  UserUpdatePersistenceInput,
  UserUpdateSnapshot,
} from '../../domain/user';

function toDomainUser(row: typeof userTable.$inferSelect): User {
  return {
    id: toUserId(row.id),
    name: row.name,
    email: toEmailAddress(row.email),
    emailVerified: row.emailVerified,
    role: row.role as UserRole,
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
  if (isPgError(error)) {
    if (error.code === '23505') {
      throw new AppError({
        code: 'USER_DUPLICATE',
        category: 'conflict',
        status: 409,
        message: 'User already exists',
        details: { target: ['email'] },
        cause: error,
      });
    }

    if (error.code === '23503') {
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
  constructor(private readonly db: Database) {}

  async list(input: {
    cursor?: UserId;
    limit: number;
    searchTerm: string;
  }): Promise<UserListPage> {
    try {
      const searchTerm = input.searchTerm.trim();
      const searchPattern = `%${escapeLikePattern(searchTerm)}%`;
      const searchFilter = searchTerm
        ? or(
            ilike(userTable.name, searchPattern),
            ilike(userTable.email, searchPattern)
          )
        : undefined;

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

      const cursorFilter = cursorRow
        ? or(
            gt(userTable.name, cursorRow.name),
            and(
              eq(userTable.name, cursorRow.name),
              gt(userTable.id, cursorRow.id)
            )
          )
        : undefined;

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

      let nextCursor: UserId | undefined;
      let pageRows = rows;
      if (rows.length > input.limit) {
        pageRows = rows.slice(0, input.limit);
        const lastVisible = pageRows.at(-1);
        nextCursor = lastVisible ? toUserId(lastVisible.id) : undefined;
      }

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
      return row
        ? { email: toEmailAddress(row.email), role: row.role as UserRole }
        : null;
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

      const cursorFilter = cursorRow
        ? or(
            and(
              eq(sessionTable.createdAt, cursorRow.createdAt),
              gt(sessionTable.id, cursorRow.id)
            ),
            lt(sessionTable.createdAt, cursorRow.createdAt)
          )
        : undefined;

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

      let nextCursor: SessionId | undefined;
      let pageRows = rows;
      if (rows.length > input.limit) {
        pageRows = rows.slice(0, input.limit);
        const lastVisible = pageRows.at(-1);
        nextCursor = lastVisible ? toSessionId(lastVisible.id) : undefined;
      }

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
        columns: { id: true, token: true },
      });

      return row ? { id: toSessionId(row.id), token: row.token } : null;
    } catch (error) {
      mapDbError(error);
    }
  }
}
