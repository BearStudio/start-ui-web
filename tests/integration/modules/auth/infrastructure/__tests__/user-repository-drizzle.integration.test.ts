import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { ApplicationResult } from '@/modules/kernel/testing';
import { toUserId } from '@/modules/kernel/domain/ids';
import {
  session as sessionTable,
  user as userTable,
} from '@/modules/kernel/infrastructure/db/schema';
import { makeSessionRow, makeUserRow } from '@tests/server/db-fixtures';
import { createPgliteTestDatabase } from '@tests/server/pglite';

import { createUserRepository } from '@/modules/auth/infrastructure/drizzle/user-repository-drizzle';

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('UserRepositoryDrizzle integration', () => {
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
    const repository = createUserRepository({ db: database.db });
    await database.db.insert(userTable).values([
      makeUserRow({
        id: 'user-a',
        name: 'Alpha_',
        email: 'alpha@example.com',
      }),
      makeUserRow({
        id: 'user-b',
        name: 'AlphaX',
        email: 'alphax@example.com',
      }),
      makeUserRow({
        id: 'user-c',
        name: 'Beta',
        email: 'beta@example.com',
      }),
      makeUserRow({
        id: 'user-d',
        name: 'Gamma',
        email: 'gamma@example.com',
      }),
    ]);

    const firstPage = getOk(
      await repository.list({ limit: 2, searchTerm: '' })
    ).page;
    expect(firstPage.items.map((user) => user.id)).toEqual([
      'user-b',
      'user-a',
    ]);
    expect(firstPage.nextCursor).toBe('user-a');

    const secondPage = getOk(
      await repository.list({
        cursor: firstPage.nextCursor,
        limit: 2,
        searchTerm: '',
      })
    ).page;
    expect(secondPage.items.map((user) => user.id)).toEqual([
      'user-c',
      'user-d',
    ]);

    const escapedSearch = getOk(
      await repository.list({
        limit: 10,
        searchTerm: 'Alpha_',
      })
    ).page;
    expect(escapedSearch.items.map((user) => user.id)).toEqual(['user-a']);
  });

  it('covers session cursor pagination with PGlite', async () => {
    const repository = createUserRepository({ db: database.db });
    await database.db.insert(userTable).values([
      makeUserRow({
        id: 'user-1',
        name: 'User',
        email: 'user@example.com',
      }),
      makeUserRow({
        id: 'user-2',
        name: 'Other User',
        email: 'other@example.com',
      }),
    ]);
    await database.db.insert(sessionTable).values([
      makeSessionRow({
        id: 'session-x',
        token: 'token-x',
        userId: 'user-2',
        createdAt: new Date('2026-01-04T00:00:00.000Z'),
        updatedAt: new Date('2026-01-04T00:00:00.000Z'),
        expiresAt: new Date('2026-02-04T00:00:00.000Z'),
      }),
      makeSessionRow({
        id: 'session-a',
        token: 'token-a',
        userId: 'user-1',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
        expiresAt: new Date('2026-02-03T00:00:00.000Z'),
      }),
      makeSessionRow({
        id: 'session-b',
        token: 'token-b',
        userId: 'user-1',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        expiresAt: new Date('2026-02-02T00:00:00.000Z'),
      }),
      makeSessionRow({
        id: 'session-c',
        token: 'token-c',
        userId: 'user-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        expiresAt: new Date('2026-02-01T00:00:00.000Z'),
      }),
    ]);

    const firstPage = getOk(
      await repository.listSessions({
        userId: toUserId('user-1'),
        limit: 2,
      })
    ).page;
    expect(firstPage.items.map((session) => session.id)).toEqual([
      'session-a',
      'session-b',
    ]);
    expect(firstPage.items.map((session) => session.id)).not.toContain(
      'session-x'
    );
    expect(firstPage.nextCursor).toBe('session-b');

    const secondPage = getOk(
      await repository.listSessions({
        userId: toUserId('user-1'),
        cursor: firstPage.nextCursor,
        limit: 2,
      })
    ).page;
    expect(secondPage.items.map((session) => session.id)).toEqual([
      'session-c',
    ]);
    expect(secondPage.items.map((session) => session.id)).not.toContain(
      'session-x'
    );
  });
});
