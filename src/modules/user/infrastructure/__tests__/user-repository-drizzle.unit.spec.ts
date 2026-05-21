import { describe, expect, it } from 'vitest';

import { toUserId } from '@/modules/kernel/domain/ids';
import {
  session as sessionTable,
  user as userTable,
} from '@/modules/kernel/infrastructure/db/schema';
import { createPgliteTestDb } from '@/tests/server/pglite';

import { UserRepositoryDrizzle } from '../drizzle/user-repository-drizzle';

describe('UserRepositoryDrizzle integration', () => {
  it('covers search pagination and escaped LIKE behavior with PGlite', async () => {
    const { client, db } = await createPgliteTestDb();
    try {
      const repository = new UserRepositoryDrizzle(db);
      await db.insert(userTable).values([
        {
          id: 'user-a',
          name: 'Alpha_',
          email: 'alpha@example.com',
          emailVerified: true,
          role: 'user',
        },
        {
          id: 'user-b',
          name: 'AlphaX',
          email: 'alphax@example.com',
          emailVerified: true,
          role: 'user',
        },
        {
          id: 'user-c',
          name: 'Beta',
          email: 'beta@example.com',
          emailVerified: true,
          role: 'user',
        },
        {
          id: 'user-d',
          name: 'Gamma',
          email: 'gamma@example.com',
          emailVerified: true,
          role: 'user',
        },
      ]);

      const firstPage = await repository.list({ limit: 2, searchTerm: '' });
      expect(firstPage.items.map((user) => user.id)).toEqual([
        'user-b',
        'user-a',
      ]);
      expect(firstPage.nextCursor).toBe('user-a');

      const secondPage = await repository.list({
        cursor: firstPage.nextCursor,
        limit: 2,
        searchTerm: '',
      });
      expect(secondPage.items.map((user) => user.id)).toEqual([
        'user-c',
        'user-d',
      ]);

      const escapedSearch = await repository.list({
        limit: 10,
        searchTerm: 'Alpha_',
      });
      expect(escapedSearch.items.map((user) => user.id)).toEqual(['user-a']);
    } finally {
      await client.close();
    }
  });

  it('covers session cursor pagination with PGlite', async () => {
    const { client, db } = await createPgliteTestDb();
    try {
      const repository = new UserRepositoryDrizzle(db);
      await db.insert(userTable).values({
        id: 'user-1',
        name: 'User',
        email: 'user@example.com',
        emailVerified: true,
        role: 'user',
      });
      await db.insert(sessionTable).values([
        {
          id: 'session-a',
          token: 'token-a',
          userId: 'user-1',
          createdAt: new Date('2026-01-03T00:00:00.000Z'),
          updatedAt: new Date('2026-01-03T00:00:00.000Z'),
          expiresAt: new Date('2026-02-03T00:00:00.000Z'),
        },
        {
          id: 'session-b',
          token: 'token-b',
          userId: 'user-1',
          createdAt: new Date('2026-01-02T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
          expiresAt: new Date('2026-02-02T00:00:00.000Z'),
        },
        {
          id: 'session-c',
          token: 'token-c',
          userId: 'user-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          expiresAt: new Date('2026-02-01T00:00:00.000Z'),
        },
      ]);

      const firstPage = await repository.listSessions({
        userId: toUserId('user-1'),
        limit: 2,
      });
      expect(firstPage.items.map((session) => session.id)).toEqual([
        'session-a',
        'session-b',
      ]);
      expect(firstPage.nextCursor).toBe('session-b');

      const secondPage = await repository.listSessions({
        userId: toUserId('user-1'),
        cursor: firstPage.nextCursor,
        limit: 2,
      });
      expect(secondPage.items.map((session) => session.id)).toEqual([
        'session-c',
      ]);
    } finally {
      await client.close();
    }
  });
});
