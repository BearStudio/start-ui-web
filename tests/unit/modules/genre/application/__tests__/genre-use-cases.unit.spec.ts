import { Result } from '@swan-io/boxed';
import { describe, expect, it } from 'vitest';

import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { ApplicationResult } from '@/modules/kernel/application/result';
import { toGenreId, toUserId } from '@/modules/kernel/domain/ids';

import type { GenreRepository } from '@/modules/genre/application/ports/genre-repository';
import type { Genre } from '@/modules/genre/domain/genre';
import { createGenreUseCases } from '@/modules/genre/factory';

const now = new Date('2026-01-01T00:00:00.000Z');
const genre: Genre = {
  id: toGenreId('genre-1'),
  name: 'Fiction',
  color: '#aabbcc',
  createdAt: now,
  updatedAt: now,
};

const logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

const repo: GenreRepository = {
  list: async () =>
    Result.Ok({
      type: 'genre_listed',
      page: { items: [genre], total: 1 },
    }),
};

const allowed: PermissionChecker = {
  hasPermission: async () => Result.Ok({ type: 'permission_granted' }),
};

const scope = {
  userId: toUserId('user-1'),
  role: 'user',
} as const;

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('genre use cases', () => {
  it('lists genres and returns forbidden when permission is missing', async () => {
    const listed = await createGenreUseCases({
      genreRepository: repo,
      permissionChecker: allowed,
      logger,
    }).list({ scope, limit: 20 });

    expect(getOk(listed)).toMatchObject({
      type: 'genre_listed',
      page: { total: 1 },
    });

    const forbidden = await createGenreUseCases({
      genreRepository: repo,
      permissionChecker: {
        hasPermission: async () => Result.Ok({ type: 'permission_denied' }),
      },
      logger,
    }).list({ scope, limit: 20 });

    expect(getOk(forbidden)).toEqual({ type: 'genre_forbidden' });
  });
});
