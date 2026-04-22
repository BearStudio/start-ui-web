import type { InferSelectModel, SQL } from 'drizzle-orm';
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  ilike,
  lt,
  or,
} from 'drizzle-orm';
import type { Logger } from 'drizzle-orm/logger';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

import { envServer } from '@/env/server';
import { timingStore } from '@/server/timing-store';

import { books, genres, schema, sessions, users } from './schema';

class ServerTimingLogger implements Logger {
  logQuery(query: string): void {
    const store = timingStore.getStore();
    if (!store) {
      return;
    }

    const normalizedQuery = query.trim().replaceAll(/\s+/g, ' ');
    const operation = normalizedQuery.split(' ')[0]?.toLowerCase() ?? 'query';
    const tableMatch = normalizedQuery.match(
      /\b(?:from|into|update)\s+"?([a-zA-Z_][\w$]*)"?/i
    );

    store.db.push({
      model: tableMatch?.[1] ?? 'unknown',
      operation,
      duration: 0,
    });
  }
}

function createDb() {
  const client = postgres(envServer.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, {
    schema,
    logger:
      envServer.LOGGER_LEVEL === 'trace' ? new ServerTimingLogger() : false,
  });
}

export type DrizzleDb = PostgresJsDatabase<typeof schema>;
type UniqueKey = { id: string };
type SortDirection = 'asc' | 'desc';
type SearchFilter =
  | { name?: { contains?: string } }
  | { email?: { contains?: string } };
type UserRecord = InferSelectModel<typeof users>;
type UserEmailRecord = Pick<UserRecord, 'email'>;
type UserFindUniqueArgs = {
  where: UniqueKey;
  select?: { email?: true };
};
type UserFindUniqueResult<TArgs extends UserFindUniqueArgs> = TArgs extends {
  select: { email: true };
}
  ? UserEmailRecord | null
  : UserRecord | null;

type UserModel = {
  count(args: { where?: { OR?: SearchFilter[] } }): Promise<number>;
  findMany(args: {
    take: number;
    cursor?: UniqueKey;
    orderBy?: { name: SortDirection };
    where?: { OR?: SearchFilter[] };
  }): Promise<UserRecord[]>;
  findUnique<TArgs extends UserFindUniqueArgs>(
    args: TArgs
  ): Promise<UserFindUniqueResult<TArgs>>;
  create(args: {
    data: {
      email: string;
      emailVerified: boolean;
      name: string;
      role: 'user' | 'admin';
    };
  }): Promise<UserRecord>;
  update(args: {
    where: UniqueKey;
    data: Partial<{
      name: string;
      role: 'user' | 'admin';
      email: string;
      emailVerified: boolean;
      onboardedAt: Date;
    }>;
  }): Promise<UserRecord>;
};

function orderByDirection<TColumn>(column: TColumn, direction: SortDirection) {
  return direction === 'desc'
    ? desc(column as Parameters<typeof desc>[0])
    : asc(column as Parameters<typeof asc>[0]);
}

function createUserModel(db: DrizzleDb): UserModel {
  const findUnique: UserModel['findUnique'] = async <
    TArgs extends UserFindUniqueArgs,
  >({
    where,
    select,
  }: TArgs) => {
    const [user] = await db
      .select(select?.email ? { email: users.email } : getTableColumns(users))
      .from(users)
      .where(eq(users.id, where.id))
      .limit(1);
    return (user ?? null) as UserFindUniqueResult<TArgs>;
  };

  return {
    async count({
      where,
    }: {
      where?: {
        OR?: Array<
          { name?: { contains?: string } } | { email?: { contains?: string } }
        >;
      };
    }) {
      const searchTerm =
        where?.OR?.[0] && 'name' in where.OR[0]
          ? where.OR[0].name?.contains
          : where?.OR?.[1] && 'email' in where.OR[1]
            ? where.OR[1].email?.contains
            : undefined;
      const filters = searchTerm
        ? or(
            ilike(users.name, `%${searchTerm}%`),
            ilike(users.email, `%${searchTerm}%`)
          )
        : undefined;
      const [result] = await db
        .select({ value: count() })
        .from(users)
        .where(filters);
      return result?.value ?? 0;
    },
    async findMany({
      take,
      cursor,
      orderBy,
      where,
    }: {
      take: number;
      cursor?: UniqueKey;
      orderBy?: { name: SortDirection };
      where?: {
        OR?: Array<
          { name?: { contains?: string } } | { email?: { contains?: string } }
        >;
      };
    }) {
      const searchTerm =
        where?.OR?.[0] && 'name' in where.OR[0]
          ? where.OR[0].name?.contains
          : where?.OR?.[1] && 'email' in where.OR[1]
            ? where.OR[1].email?.contains
            : undefined;
      const filters: SQL[] = [];
      if (searchTerm) {
        filters.push(
          or(
            ilike(users.name, `%${searchTerm}%`),
            ilike(users.email, `%${searchTerm}%`)
          )!
        );
      }
      if (cursor?.id) {
        const [cursorUser] = await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(eq(users.id, cursor.id))
          .limit(1);

        if (cursorUser) {
          filters.push(
            or(
              gt(users.name, cursorUser.name),
              and(eq(users.name, cursorUser.name), gt(users.id, cursorUser.id))
            )!
          );
        }
      }

      return await db
        .select()
        .from(users)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(
          orderByDirection(users.name, orderBy?.name ?? 'asc'),
          asc(users.id)
        )
        .limit(take);
    },
    findUnique,
    async create({
      data,
    }: {
      data: {
        email: string;
        emailVerified: boolean;
        name: string;
        role: 'user' | 'admin';
      };
    }) {
      const [user] = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email: data.email,
          emailVerified: data.emailVerified,
          name: data.name,
          role: data.role,
        })
        .returning();
      if (!user) {
        throw new Error('Failed to create user');
      }
      return user;
    },
    async update({
      where,
      data,
    }: {
      where: UniqueKey;
      data: Partial<{
        name: string;
        role: 'user' | 'admin';
        email: string;
        emailVerified: boolean;
        onboardedAt: Date;
      }>;
    }) {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
      );
      const [user] = await db
        .update(users)
        .set(payload)
        .where(eq(users.id, where.id))
        .returning();
      if (!user) {
        throw new Error('Failed to update user');
      }
      return user;
    },
  };
}

function createSessionModel(db: DrizzleRuntimeDb) {
  return {
    async count({ where }: { where: { userId: string } }) {
      const [result] = await db
        .select({ value: count() })
        .from(sessions)
        .where(eq(sessions.userId, where.userId));
      return result?.value ?? 0;
    },
    async findMany({
      take,
      cursor,
      orderBy,
      where,
    }: {
      take: number;
      cursor?: UniqueKey;
      orderBy?: { createdAt: SortDirection };
      where: { userId: string };
    }) {
      const filters: SQL[] = [eq(sessions.userId, where.userId)];
      if (cursor?.id) {
        const [cursorSession] = await db
          .select({ id: sessions.id, createdAt: sessions.createdAt })
          .from(sessions)
          .where(eq(sessions.id, cursor.id))
          .limit(1);
        if (cursorSession) {
          filters.push(
            or(
              lt(sessions.createdAt, cursorSession.createdAt),
              and(
                eq(sessions.createdAt, cursorSession.createdAt),
                lt(sessions.id, cursorSession.id)
              )
            )!
          );
        }
      }
      return await db
        .select({
          id: sessions.id,
          token: sessions.token,
          createdAt: sessions.createdAt,
          updatedAt: sessions.updatedAt,
          expiresAt: sessions.expiresAt,
        })
        .from(sessions)
        .where(and(...filters))
        .orderBy(
          orderByDirection(sessions.createdAt, orderBy?.createdAt ?? 'desc'),
          desc(sessions.id)
        )
        .limit(take);
    },
    async findFirstForUser({
      userId,
      sessionId,
    }: {
      userId: string;
      sessionId: string;
    }) {
      const [session] = await db
        .select({
          id: sessions.id,
          token: sessions.token,
          createdAt: sessions.createdAt,
          updatedAt: sessions.updatedAt,
          expiresAt: sessions.expiresAt,
          userId: sessions.userId,
        })
        .from(sessions)
        .where(and(eq(sessions.userId, userId), eq(sessions.id, sessionId)))
        .limit(1);

      return session ?? null;
    },
  };
}

function createGenreModel(db: DrizzleDb) {
  const getFilters = (where?: { name?: { contains?: string } }) => {
    const filters: SQL[] = [];
    if (where?.name?.contains) {
      filters.push(ilike(genres.name, `%${where.name.contains}%`));
    }

    return filters;
  };

  return {
    async count({ where }: { where?: { name?: { contains?: string } } }) {
      const [result] = await db
        .select({ value: count() })
        .from(genres)
        .where(
          where?.name?.contains
            ? ilike(genres.name, `%${where.name.contains}%`)
            : undefined
        );
      return result?.value ?? 0;
    },
    async findMany({
      take,
      cursor,
      orderBy,
      where,
    }: {
      take: number;
      cursor?: UniqueKey;
      orderBy?: { name: SortDirection };
      where?: { name?: { contains?: string } };
    }) {
      const filters = getFilters(where);
      if (cursor?.id) {
        const [cursorGenre] = await db
          .select({ id: genres.id, name: genres.name })
          .from(genres)
          .where(eq(genres.id, cursor.id))
          .limit(1);
        if (cursorGenre) {
          filters.push(
            or(
              gt(genres.name, cursorGenre.name),
              and(
                eq(genres.name, cursorGenre.name),
                gt(genres.id, cursorGenre.id)
              )
            )!
          );
        }
      }

      return await db
        .select()
        .from(genres)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(
          orderByDirection(genres.name, orderBy?.name ?? 'asc'),
          asc(genres.id)
        )
        .limit(take);
    },
    async findAll({
      orderBy,
      where,
    }: {
      orderBy?: { name: SortDirection };
      where?: { name?: { contains?: string } };
    }) {
      const filters = getFilters(where);

      return await db
        .select()
        .from(genres)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(
          orderByDirection(genres.name, orderBy?.name ?? 'asc'),
          asc(genres.id)
        );
    },
  };
}

function createBookModel(db: DrizzleDb) {
  return {
    async count({
      where,
    }: {
      where?: {
        OR?: Array<
          { title?: { contains?: string } } | { author?: { contains?: string } }
        >;
      };
    }) {
      const searchTerm =
        where?.OR?.[0] && 'title' in where.OR[0]
          ? where.OR[0].title?.contains
          : where?.OR?.[1] && 'author' in where.OR[1]
            ? where.OR[1].author?.contains
            : undefined;
      const [result] = await db
        .select({ value: count() })
        .from(books)
        .where(
          searchTerm
            ? or(
                ilike(books.title, `%${searchTerm}%`),
                ilike(books.author, `%${searchTerm}%`)
              )
            : undefined
        );
      return result?.value ?? 0;
    },
    async findMany({
      take,
      cursor,
      orderBy,
      where,
    }: {
      take: number;
      cursor?: UniqueKey;
      orderBy?: { title: SortDirection };
      where?: {
        OR?: Array<
          { title?: { contains?: string } } | { author?: { contains?: string } }
        >;
      };
      include?: { genre: true };
    }) {
      const searchTerm =
        where?.OR?.[0] && 'title' in where.OR[0]
          ? where.OR[0].title?.contains
          : where?.OR?.[1] && 'author' in where.OR[1]
            ? where.OR[1].author?.contains
            : undefined;
      const filters: SQL[] = [];
      if (searchTerm) {
        filters.push(
          or(
            ilike(books.title, `%${searchTerm}%`),
            ilike(books.author, `%${searchTerm}%`)
          )!
        );
      }
      if (cursor?.id) {
        const [cursorBook] = await db
          .select({ id: books.id, title: books.title })
          .from(books)
          .where(eq(books.id, cursor.id))
          .limit(1);
        if (cursorBook) {
          filters.push(
            or(
              gt(books.title, cursorBook.title),
              and(
                eq(books.title, cursorBook.title),
                gt(books.id, cursorBook.id)
              )
            )!
          );
        }
      }

      return await db.query.books.findMany({
        where: filters.length ? and(...filters) : undefined,
        with: { genre: true },
        orderBy: [
          orderByDirection(books.title, orderBy?.title ?? 'asc'),
          asc(books.id),
        ],
        limit: take,
      });
    },
    async findUnique({
      where,
      include,
    }: {
      where: UniqueKey;
      include?: { genre: true };
    }) {
      return (
        (include?.genre
          ? await db.query.books.findFirst({
              where: eq(books.id, where.id),
              with: { genre: true },
            })
          : await db.query.books.findFirst({
              where: eq(books.id, where.id),
            })) ?? null
      );
    },
    async create({
      data,
    }: {
      data: {
        title: string;
        author: string;
        genreId?: string;
        publisher?: string | null;
        coverId?: string | null;
      };
    }) {
      const [book] = await db
        .insert(books)
        .values({
          id: crypto.randomUUID(),
          title: data.title,
          author: data.author,
          genreId: data.genreId!,
          publisher: data.publisher ?? null,
          coverId: data.coverId ?? null,
        })
        .returning();
      if (!book) {
        throw new Error('Failed to create book');
      }
      return (await db.query.books.findFirst({
        where: eq(books.id, book.id),
        with: { genre: true },
      }))!;
    },
    async update({
      where,
      data,
    }: {
      where: UniqueKey;
      data: Partial<{
        title: string;
        author: string;
        genreId: string | null;
        publisher: string | null;
        coverId: string | null;
      }>;
    }) {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
      );
      const [book] = await db
        .update(books)
        .set(payload)
        .where(eq(books.id, where.id))
        .returning();
      if (!book) {
        return null;
      }
      return (await db.query.books.findFirst({
        where: eq(books.id, book.id),
        with: { genre: true },
      }))!;
    },
    async delete({ where }: { where: UniqueKey }) {
      const [book] = await db
        .delete(books)
        .where(eq(books.id, where.id))
        .returning();
      return book ?? null;
    },
  };
}

type DrizzleRuntimeDb = DrizzleDb & {
  $client: Sql;
};

type RuntimeModelMap = {
  user: UserModel;
  session: ReturnType<typeof createSessionModel>;
  genre: ReturnType<typeof createGenreModel>;
  book: ReturnType<typeof createBookModel>;
};

export type RuntimeDb = DrizzleRuntimeDb & RuntimeModelMap;

type GlobalDb = {
  drizzleDb: DrizzleRuntimeDb | undefined;
  db: RuntimeDb | undefined;
};

const runtimeModels = new WeakMap<DrizzleDb, RuntimeModelMap>();

function hasOwnProperty<T extends object>(
  value: T,
  property: PropertyKey
): property is keyof T {
  return Object.prototype.hasOwnProperty.call(value, property);
}

function getRuntimeModels(db: DrizzleRuntimeDb) {
  let models = runtimeModels.get(db as DrizzleDb);

  if (!models) {
    models = {
      user: createUserModel(db),
      session: createSessionModel(db),
      genre: createGenreModel(db),
      book: createBookModel(db),
    };
    runtimeModels.set(db as DrizzleDb, models);
  }

  return models;
}

function createRuntimeDb(drizzleDb: DrizzleRuntimeDb) {
  const models = getRuntimeModels(drizzleDb);

  return new Proxy(drizzleDb, {
    get(target, property, receiver) {
      if (property === '$client') {
        return target.$client;
      }

      if (hasOwnProperty(models, property)) {
        return Reflect.get(models, property);
      }

      const value = Reflect.get(target, property, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }) as RuntimeDb;
}

const globalForDb = globalThis as unknown as GlobalDb;

export const drizzleDb = (globalForDb.drizzleDb ??
  (createDb() as DrizzleRuntimeDb)) as DrizzleRuntimeDb;
export const db = globalForDb.db ?? createRuntimeDb(drizzleDb);

if (import.meta.env.DEV) {
  globalForDb.drizzleDb = drizzleDb;
  globalForDb.db = db;
}
