import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BookRepository } from '@/modules/book';
import { toBookId, toGenreId, toUserId } from '@/modules/kernel/domain/ids';

import { makeTestKernel, now } from './helpers';
import { __resetBookComposition, getBookUseCases } from '../book';

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
  list: async () => ({ items: [book], total: 1 }),
  getById: async () => book,
  create: async () => book,
  update: async () => book,
  delete: async () => true,
  ...overrides,
});

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
    const list = vi.fn(async () => ({ items: [book], total: 1 }));
    const useCases = getBookUseCases({
      kernel: makeTestKernel(),
      bookRepository: makeBookRepository({ list }),
    });

    await expect(
      useCases.list({
        currentUserId: toUserId('user-1'),
        limit: 20,
        searchTerm: 'du',
      })
    ).resolves.toMatchObject({ ok: true, value: { total: 1 } });
    expect(list).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 20,
      searchTerm: 'du',
    });
  });
});
