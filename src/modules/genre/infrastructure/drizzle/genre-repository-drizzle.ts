import { Result } from '@swan-io/boxed';
import { and, asc, eq, sql } from 'drizzle-orm';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { toGenreId } from '@/modules/kernel/domain/ids';
import {
  getConstraintName,
  isUniqueConstraintViolation,
} from '@/modules/kernel/infrastructure/db/errors';
import { observeRepository } from '@/modules/kernel/infrastructure/db/observability';
import {
  ascendingTextCursorFilter,
  escapedIlikeFilter,
  takeCursorPage,
} from '@/modules/kernel/infrastructure/db/query-helpers';
import { genre as genreTable } from '@/modules/kernel/infrastructure/db/schema';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';

import type { GenreRepository } from '../../application/ports/genre-repository';
import type { Genre } from '../../domain/genre';

function toDomain(row: typeof genreTable.$inferSelect): Genre {
  return {
    id: toGenreId(row.id),
    name: row.name,
    color: row.color,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapDbError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (
    isUniqueConstraintViolation(error) &&
    getConstraintName(error) === 'genre_name_key'
  ) {
    return new AppError({
      code: 'GENRE_DUPLICATE',
      category: 'conflict',
      status: 409,
      message: 'Genre already exists',
      details: { target: ['name'] },
      cause: error,
    });
  }

  return new AppError({
    code: 'GENRE_REPOSITORY_ERROR',
    category: 'system',
    status: 500,
    message: 'Genre repository error',
    cause: error,
  });
}

export class GenreRepositoryDrizzle implements GenreRepository {
  constructor(private readonly db: DbLike) {}

  async list(input: Parameters<GenreRepository['list']>[0]) {
    try {
      const searchFilter = escapedIlikeFilter(
        [genreTable.name],
        input.searchTerm
      );

      const cursorRow = input.cursor
        ? await this.db.query.genre.findFirst({
            where: eq(genreTable.id, input.cursor),
            columns: { id: true, name: true },
          })
        : undefined;

      if (input.cursor && !cursorRow) {
        const [totalResult] = await this.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(genreTable)
          .where(searchFilter);

        return Result.Ok({
          type: 'genre_listed' as const,
          page: {
            items: [],
            nextCursor: undefined,
            total: totalResult?.count ?? 0,
          },
        });
      }

      const cursorFilter = ascendingTextCursorFilter({
        sortColumn: genreTable.name,
        idColumn: genreTable.id,
        cursor: cursorRow
          ? { id: cursorRow.id, sortValue: cursorRow.name }
          : undefined,
      });

      const where = and(searchFilter, cursorFilter);

      const [total, rows] = await Promise.all([
        this.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(genreTable)
          .where(searchFilter),
        this.db.query.genre.findMany({
          where,
          orderBy: [asc(genreTable.name), asc(genreTable.id)],
          limit: input.limit + 1,
        }),
      ]);

      const { pageRows, nextCursor } = takeCursorPage(
        rows,
        input.limit,
        (row) => toGenreId(row.id)
      );

      return Result.Ok({
        type: 'genre_listed' as const,
        page: {
          items: pageRows.map(toDomain),
          nextCursor,
          total: total[0]?.count ?? 0,
        },
      });
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }
}

export interface GenreRepositoryDrizzleDependencies {
  db: DbLike;
}

export function createGenreRepository(
  dependencies: GenreRepositoryDrizzleDependencies
): GenreRepository {
  return observeRepository(
    new GenreRepositoryDrizzle(dependencies.db),
    'genre'
  );
}
