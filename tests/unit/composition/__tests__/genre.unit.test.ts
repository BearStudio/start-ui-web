import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GenreRepository } from '@/modules/genre';
import { toGenreId, toUserId } from '@/modules/kernel/domain/ids';

import { makeTestKernel, now } from '@tests/unit/composition/helpers';
import { __resetGenreComposition, getGenreUseCases } from '@/composition/genre';

const genre = {
  id: toGenreId('genre-1'),
  name: 'Fiction',
  color: '#aabbcc',
  createdAt: now,
  updatedAt: now,
};

const makeGenreRepository = (
  overrides: Partial<GenreRepository> = {}
): GenreRepository => ({
  list: async () => ({ items: [genre], total: 1 }),
  ...overrides,
});

const scope = (userId: string) =>
  ({ userId: toUserId(userId), role: 'user' }) as const;

describe('genre composition', () => {
  beforeEach(() => {
    __resetGenreComposition();
  });

  it('returns a singleton with use case methods when no overrides are provided', () => {
    const first = getGenreUseCases();
    const second = getGenreUseCases();

    expect(first).toBe(second);
    expect(typeof first.list).toBe('function');
  });

  it('returns a fresh object when overrides are provided', () => {
    const singleton = getGenreUseCases();
    const overridden = getGenreUseCases({
      kernel: makeTestKernel(),
      genreRepository: makeGenreRepository(),
    });

    expect(overridden).not.toBe(singleton);
  });

  it('routes use case calls through the overridden repository', async () => {
    const list = vi.fn(async () => ({ items: [genre], total: 1 }));
    const useCases = getGenreUseCases({
      kernel: makeTestKernel(),
      genreRepository: makeGenreRepository({ list }),
    });

    await expect(
      useCases.list({
        scope: scope('user-1'),
        limit: 20,
        searchTerm: 'fic',
      })
    ).resolves.toMatchObject({ ok: true, value: { total: 1 } });
    expect(list).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 20,
      searchTerm: 'fic',
    });
  });
});
