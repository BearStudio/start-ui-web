import { and, asc, eq, gt, ilike, or, sql } from 'drizzle-orm';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { BookId } from '@/modules/kernel/domain/ids';
import { toBookId, toGenreId } from '@/modules/kernel/domain/ids';
import type { Database } from '@/modules/kernel/infrastructure/db/client';
import { isPgError } from '@/modules/kernel/infrastructure/db/errors';
import { escapeLikePattern } from '@/modules/kernel/infrastructure/db/like';
import { book as bookTable } from '@/modules/kernel/infrastructure/db/schema';

import type { BookRepository } from '../../application/ports/book-repository';
import type { Book, BookListPage, BookWriteInput } from '../../domain/book';

type BookRow = typeof bookTable.$inferSelect & {
  genre?: {
    id: string;
    name: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

function toDomain(row: BookRow): Book {
  return {
    id: toBookId(row.id),
    title: row.title,
    author: row.author,
    genreId: toGenreId(row.genreId),
    genre: row.genre
      ? {
          id: toGenreId(row.genre.id),
          name: row.genre.name,
          color: row.genre.color,
          createdAt: row.genre.createdAt,
          updatedAt: row.genre.updatedAt,
        }
      : null,
    publisher: row.publisher,
    coverId: row.coverId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapDbError(error: unknown): never {
  if (isPgError(error)) {
    if (error.code === '23505') {
      throw new AppError({
        code: 'BOOK_DUPLICATE',
        category: 'conflict',
        status: 409,
        message: 'Book already exists',
        details: { target: ['title', 'author'] },
        cause: error,
      });
    }

    if (error.code === '23503') {
      throw new AppError({
        code: 'BOOK_FOREIGN_KEY',
        category: 'bad_request',
        status: 400,
        message: 'Invalid book relationship',
        cause: error,
      });
    }
  }

  throw new AppError({
    code: 'BOOK_REPOSITORY_ERROR',
    category: 'system',
    status: 500,
    message: 'Book repository error',
    cause: error,
  });
}

export class BookRepositoryDrizzle implements BookRepository {
  constructor(private readonly db: Database) {}

  async list(input: {
    cursor?: BookId;
    limit: number;
    searchTerm: string;
  }): Promise<BookListPage> {
    try {
      const searchPattern = `%${escapeLikePattern(input.searchTerm.trim())}%`;
      const searchFilter = input.searchTerm
        ? or(
            ilike(bookTable.title, searchPattern),
            ilike(bookTable.author, searchPattern)
          )
        : undefined;

      const cursorRow = input.cursor
        ? await this.db.query.book.findFirst({
            where: eq(bookTable.id, input.cursor),
            columns: { id: true, title: true },
          })
        : undefined;

      if (input.cursor && !cursorRow) {
        const [totalResult] = await this.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(bookTable)
          .where(searchFilter);

        return {
          items: [],
          nextCursor: undefined,
          total: totalResult?.count ?? 0,
        };
      }

      const cursorFilter = cursorRow
        ? or(
            gt(bookTable.title, cursorRow.title),
            and(
              eq(bookTable.title, cursorRow.title),
              gt(bookTable.id, cursorRow.id)
            )
          )
        : undefined;

      const where = and(searchFilter, cursorFilter);

      const [total, rows] = await Promise.all([
        this.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(bookTable)
          .where(searchFilter),
        this.db.query.book.findMany({
          where,
          orderBy: [asc(bookTable.title), asc(bookTable.id)],
          limit: input.limit + 1,
          with: { genre: true },
        }),
      ]);

      let nextCursor: BookId | undefined;
      if (rows.length > input.limit) {
        const nextItem = rows.pop();
        nextCursor = nextItem ? toBookId(nextItem.id) : undefined;
      }

      return {
        items: rows.map(toDomain),
        nextCursor,
        total: total[0]?.count ?? 0,
      };
    } catch (error) {
      mapDbError(error);
    }
  }

  async getById(id: BookId): Promise<Book | null> {
    try {
      const row = await this.db.query.book.findFirst({
        where: eq(bookTable.id, id),
        with: { genre: true },
      });
      return row ? toDomain(row) : null;
    } catch (error) {
      mapDbError(error);
    }
  }

  async create(input: BookWriteInput): Promise<Book> {
    try {
      const [created] = await this.db
        .insert(bookTable)
        .values({
          title: input.title,
          author: input.author,
          genreId: input.genreId,
          publisher: input.publisher ?? null,
          coverId: input.coverId ?? null,
        })
        .returning();

      if (!created) {
        throw new AppError({
          code: 'BOOK_CREATE_EMPTY_RESULT',
          category: 'system',
          status: 500,
          message: 'Book create returned no row',
        });
      }

      return toDomain(created);
    } catch (error) {
      if (error instanceof AppError) throw error;
      mapDbError(error);
    }
  }

  async update(id: BookId, input: BookWriteInput): Promise<Book | null> {
    try {
      const [updated] = await this.db
        .update(bookTable)
        .set({
          title: input.title,
          author: input.author,
          genreId: input.genreId,
          publisher: input.publisher ?? null,
          coverId: input.coverId ?? null,
        })
        .where(eq(bookTable.id, id))
        .returning();

      return updated ? toDomain(updated) : null;
    } catch (error) {
      mapDbError(error);
    }
  }

  async delete(id: BookId): Promise<boolean> {
    try {
      const [deleted] = await this.db
        .delete(bookTable)
        .where(eq(bookTable.id, id))
        .returning({ id: bookTable.id });

      return Boolean(deleted);
    } catch (error) {
      mapDbError(error);
    }
  }
}
