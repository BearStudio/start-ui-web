import { makeGenreRow } from '@tests/server/db-fixtures';
import { createPgliteTestDatabase } from '@tests/server/pglite';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createGenreRepository } from '@/modules/genre/infrastructure/drizzle/genre-repository-drizzle';
import { genre as genreTable } from '@/modules/kernel/infrastructure/db/schema';
import type { ApplicationResult } from '@/modules/kernel/testing';

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('GenreRepositoryDrizzle integration', () => {
  let database: Awaited<ReturnType<typeof createPgliteTestDatabase>>;

  beforeAll(async () => {
    database = await createPgliteTestDatabase();
  });

  beforeEach(async () => {
    await database.truncate();
  });

  afterAll(async () => {
    await database?.close();
  });

  it('covers search pagination and escaped LIKE behavior with PGlite', async () => {
    const repository = createGenreRepository({ db: database.db });
    await database.db
      .insert(genreTable)
      .values([
        makeGenreRow({ id: 'genre-a', name: 'Alpha_', color: '#111111' }),
        makeGenreRow({ id: 'genre-b', name: 'AlphaX', color: '#222222' }),
        makeGenreRow({ id: 'genre-c', name: 'Beta', color: '#333333' }),
        makeGenreRow({ id: 'genre-d', name: 'Gamma', color: '#444444' }),
      ]);

    const firstPage = getOk(
      await repository.list({ limit: 2, searchTerm: '' })
    ).page;
    expect(firstPage.items.map((genre) => genre.id)).toEqual([
      'genre-b',
      'genre-a',
    ]);
    expect(firstPage.nextCursor).toBe('genre-a');

    const secondPage = getOk(
      await repository.list({
        cursor: firstPage.nextCursor,
        limit: 2,
        searchTerm: '',
      })
    ).page;
    expect(secondPage.items.map((genre) => genre.id)).toEqual([
      'genre-c',
      'genre-d',
    ]);

    const escapedSearch = getOk(
      await repository.list({
        limit: 10,
        searchTerm: 'Alpha_',
      })
    ).page;
    expect(escapedSearch.items.map((genre) => genre.id)).toEqual(['genre-a']);
  });
});
