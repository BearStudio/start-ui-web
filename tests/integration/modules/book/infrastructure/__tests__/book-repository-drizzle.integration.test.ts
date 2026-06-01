import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { ApplicationResult } from '@/modules/kernel/application/result';
import { toBookId, toGenreId } from '@/modules/kernel/domain/ids';
import {
  book as bookTable,
  genre as genreTable,
} from '@/modules/kernel/infrastructure/db/schema';
import { makeBookRow, makeGenreRow } from '@tests/server/db-fixtures';
import { createPgliteTestDatabase } from '@tests/server/pglite';

import { createBookRepository } from '@/modules/book/infrastructure/drizzle/book-repository-drizzle';

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('BookRepositoryDrizzle integration', () => {
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
    const repository = createBookRepository({ db: database.db });
    await database.db
      .insert(genreTable)
      .values([
        makeGenreRow({ id: 'genre-1', name: 'One', color: '#111111' }),
        makeGenreRow({ id: 'genre-2', name: 'Two', color: '#222222' }),
      ]);
    await database.db.insert(bookTable).values([
      makeBookRow({
        id: 'book-a',
        title: 'Alpha_ Old',
        author: 'Author A Old',
        genreId: 'genre-1',
        publisher: 'Old Publisher',
        coverId: 'old-cover-id',
      }),
      makeBookRow({
        id: 'book-b',
        title: 'AlphaX',
        author: 'Author B',
        genreId: 'genre-1',
      }),
      makeBookRow({
        id: 'book-c',
        title: 'Beta',
        author: 'Author C',
        genreId: 'genre-1',
      }),
      makeBookRow({
        id: 'book-d',
        title: 'Gamma',
        author: 'Author D',
        genreId: 'genre-1',
      }),
    ]);

    const firstPage = getOk(
      await repository.list({ limit: 2, searchTerm: '' })
    ).page;
    expect(firstPage.items.map((book) => book.id)).toEqual([
      'book-b',
      'book-a',
    ]);
    expect(firstPage.nextCursor).toBe('book-a');

    const secondPage = getOk(
      await repository.list({
        cursor: firstPage.nextCursor,
        limit: 2,
        searchTerm: '',
      })
    ).page;
    expect(secondPage.items.map((book) => book.id)).toEqual([
      'book-c',
      'book-d',
    ]);

    const escapedSearch = getOk(
      await repository.list({
        limit: 10,
        searchTerm: 'Alpha_',
      })
    ).page;
    expect(escapedSearch.items.map((book) => book.id)).toEqual(['book-a']);

    const updated = getOk(
      await repository.update(toBookId('book-a'), {
        title: 'Alpha_ New',
        author: 'Author A New',
        genreId: toGenreId('genre-2'),
        publisher: null,
        coverId: null,
      })
    );
    expect(updated.type).toBe('book_updated');
    if (updated.type !== 'book_updated') return;
    expect(updated.book.genre).toMatchObject({ id: 'genre-2', name: 'Two' });

    const persisted = await database.db.query.book.findFirst({
      where: eq(bookTable.id, 'book-a'),
      with: { genre: true },
    });
    expect(persisted).toMatchObject({
      title: 'Alpha_ New',
      author: 'Author A New',
      publisher: null,
      coverId: null,
      genre: { id: 'genre-2', name: 'Two' },
    });
  });
});
