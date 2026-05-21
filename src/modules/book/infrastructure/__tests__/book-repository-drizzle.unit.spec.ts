import { describe, expect, it } from 'vitest';

import { toBookId, toGenreId } from '@/modules/kernel/domain/ids';
import {
  book as bookTable,
  genre as genreTable,
} from '@/modules/kernel/infrastructure/db/schema';
import { createPgliteTestDb } from '@/tests/server/pglite';

import { BookRepositoryDrizzle } from '../drizzle/book-repository-drizzle';

describe('BookRepositoryDrizzle integration', () => {
  it('covers search pagination and escaped LIKE behavior with PGlite', async () => {
    const { client, db } = await createPgliteTestDb();
    try {
      const repository = new BookRepositoryDrizzle(db);
      await db.insert(genreTable).values([
        { id: 'genre-1', name: 'One', color: '#111111' },
        { id: 'genre-2', name: 'Two', color: '#222222' },
      ]);
      await db.insert(bookTable).values([
        {
          id: 'book-a',
          title: 'Alpha_',
          author: 'Author A',
          genreId: 'genre-1',
        },
        {
          id: 'book-b',
          title: 'AlphaX',
          author: 'Author B',
          genreId: 'genre-1',
        },
        {
          id: 'book-c',
          title: 'Beta',
          author: 'Author C',
          genreId: 'genre-1',
        },
        {
          id: 'book-d',
          title: 'Gamma',
          author: 'Author D',
          genreId: 'genre-1',
        },
      ]);

      const firstPage = await repository.list({ limit: 2, searchTerm: '' });
      expect(firstPage.items.map((book) => book.id)).toEqual([
        'book-b',
        'book-a',
      ]);
      expect(firstPage.nextCursor).toBe('book-a');

      const secondPage = await repository.list({
        cursor: firstPage.nextCursor,
        limit: 2,
        searchTerm: '',
      });
      expect(secondPage.items.map((book) => book.id)).toEqual([
        'book-c',
        'book-d',
      ]);

      const escapedSearch = await repository.list({
        limit: 10,
        searchTerm: 'Alpha_',
      });
      expect(escapedSearch.items.map((book) => book.id)).toEqual(['book-a']);

      const updated = await repository.update(toBookId('book-a'), {
        title: 'Alpha_',
        author: 'Author A',
        genreId: toGenreId('genre-2'),
        publisher: null,
        coverId: null,
      });
      expect(updated?.genre).toMatchObject({ id: 'genre-2', name: 'Two' });
    } finally {
      await client.close();
    }
  });
});
