import { Result } from '@swan-io/boxed';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GenreRepository } from '@/modules/genre';
import type { ApplicationResult } from '@/modules/kernel/testing';
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
  list: async () =>
    Result.Ok({ type: 'genre_listed', page: { items: [genre], total: 1 } }),
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
    const list = vi.fn(async () =>
      Result.Ok({
        type: 'genre_listed' as const,
        page: { items: [genre], total: 1 },
      })
    );
    const useCases = getGenreUseCases({
      kernel: makeTestKernel(),
      genreRepository: makeGenreRepository({ list }),
    });

    const result = await useCases.list({
      currentUserId: scope('user-1').userId,
      limit: 20,
      searchTerm: 'fic',
    });

    expect(getOk(result)).toMatchObject({
      type: 'genre_listed',
      page: { total: 1 },
    });
    expect(list).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 20,
      searchTerm: 'fic',
    });
  });
});
