import { describe, expect, it } from 'vitest';

import { genre as genreTable } from '@/modules/kernel/infrastructure/db/schema';
import { createPgliteTestDb } from '@/tests/server/pglite';

import { GenreRepositoryDrizzle } from '../drizzle/genre-repository-drizzle';

describe('GenreRepositoryDrizzle integration', () => {
  it('covers search pagination and escaped LIKE behavior with PGlite', async () => {
    const { client, db } = await createPgliteTestDb();
    try {
      const repository = new GenreRepositoryDrizzle(db);
      await db.insert(genreTable).values([
        { id: 'genre-a', name: 'Alpha_', color: '#111111' },
        { id: 'genre-b', name: 'AlphaX', color: '#222222' },
        { id: 'genre-c', name: 'Beta', color: '#333333' },
        { id: 'genre-d', name: 'Gamma', color: '#444444' },
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
    } finally {
      await client.close();
    }
  });
});
