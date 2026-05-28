import { describe, expect, it } from 'vitest';

import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import { toGenreId, toUserId } from '@/modules/kernel/domain/ids';

import type { GenreRepository } from '../ports/genre-repository';
import type { Genre } from '../../domain/genre';
import { createGenreUseCases } from '../../factory';

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
  list: async () => ({ items: [genre], total: 1 }),
};

const allowed: PermissionChecker = {
  hasPermission: async () => true,
};

const scope = {
  userId: toUserId('user-1'),
  role: 'user',
} as const;

describe('genre use cases', () => {
  it('lists genres and returns forbidden when permission is missing', async () => {
    await expect(
      createGenreUseCases({
        genreRepository: repo,
        permissionChecker: allowed,
        logger,
      }).list({ scope, limit: 20 })
    ).resolves.toMatchObject({ ok: true, value: { total: 1 } });

    await expect(
      createGenreUseCases({
        genreRepository: repo,
        permissionChecker: { hasPermission: async () => false },
        logger,
      }).list({ scope, limit: 20 })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
  });
});
