import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { genre as genreTable } from '@/modules/kernel/infrastructure/db/schema';
import { makeGenreRow } from '@tests/server/db-fixtures';
import { createPgliteTestDatabase } from '@tests/server/pglite';

import { createGenreRepository } from '@/modules/genre/infrastructure/drizzle/genre-repository-drizzle';

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

    const firstPage = await repository.list({ limit: 2, searchTerm: '' });
    expect(firstPage.items.map((genre) => genre.id)).toEqual([
      'genre-b',
      'genre-a',
    ]);
    expect(firstPage.nextCursor).toBe('genre-a');

    const secondPage = await repository.list({
      cursor: firstPage.nextCursor,
      limit: 2,
      searchTerm: '',
    });
    expect(secondPage.items.map((genre) => genre.id)).toEqual([
      'genre-c',
      'genre-d',
    ]);

    const escapedSearch = await repository.list({
      limit: 10,
      searchTerm: 'Alpha_',
    });
    expect(escapedSearch.items.map((genre) => genre.id)).toEqual(['genre-a']);
  });
});
