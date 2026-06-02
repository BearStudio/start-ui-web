import { Result } from '@swan-io/boxed';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BookRepository } from '@/modules/book';
import type { ApplicationResult } from '@/modules/kernel/testing';
import { toBookId, toGenreId, toUserId } from '@/modules/kernel/domain/ids';

import { makeTestKernel, now } from '@tests/unit/composition/helpers';
import { __resetBookComposition, getBookUseCases } from '@/composition/book';

const book = {
  id: toBookId('book-1'),
  title: 'Dune',
  author: 'Frank Herbert',
  genreId: toGenreId('genre-1'),
  genre: null,
  publisher: null,
  coverId: null,
  createdAt: now,
  updatedAt: now,
};

const makeBookRepository = (
  overrides: Partial<BookRepository> = {}
): BookRepository => ({
  list: async () =>
    Result.Ok({ type: 'book_listed', page: { items: [book], total: 1 } }),
  getById: async () => Result.Ok({ type: 'book_found', book }),
  create: async () => Result.Ok({ type: 'book_created', book }),
  update: async () => Result.Ok({ type: 'book_updated', book }),
  delete: async () => Result.Ok({ type: 'book_deleted' }),
  ...overrides,
});

const scope = (userId: string) =>
  ({ userId: toUserId(userId), role: 'user' }) as const;

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('book composition', () => {
  beforeEach(() => {
    __resetBookComposition();
  });

  it('returns a singleton with use case methods when no overrides are provided', () => {
    const first = getBookUseCases();
    const second = getBookUseCases();

    expect(first).toBe(second);
    expect(typeof first.list).toBe('function');
  });

  it('returns a fresh object when overrides are provided', () => {
    const singleton = getBookUseCases();
    const overridden = getBookUseCases({
      kernel: makeTestKernel(),
      bookRepository: makeBookRepository(),
    });

    expect(overridden).not.toBe(singleton);
  });

  it('routes use case calls through the overridden repository', async () => {
    const list = vi.fn(async () =>
      Result.Ok({
        type: 'book_listed' as const,
        page: { items: [book], total: 1 },
      })
    );
    const useCases = getBookUseCases({
      kernel: makeTestKernel(),
      bookRepository: makeBookRepository({ list }),
    });

    const result = await useCases.list({
      currentUserId: scope('user-1').userId,
      limit: 20,
      searchTerm: 'du',
    });

    expect(getOk(result)).toMatchObject({
      type: 'book_listed',
      page: { total: 1 },
    });
    expect(list).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 20,
      searchTerm: 'du',
    });
  });
});
