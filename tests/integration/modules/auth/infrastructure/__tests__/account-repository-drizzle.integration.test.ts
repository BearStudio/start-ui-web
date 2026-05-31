import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { toUserId } from '@/modules/kernel/domain/ids';
import { user as userTable } from '@/modules/kernel/infrastructure/db/schema';
import { makeUserRow } from '@tests/server/db-fixtures';
import { createPgliteTestDatabase } from '@tests/server/pglite';

import { AccountRepositoryDrizzle } from '@/modules/auth/infrastructure/drizzle/account-repository-drizzle';

describe('AccountRepositoryDrizzle integration', () => {
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

  it('covers account update behavior with PGlite', async () => {
    const repository = new AccountRepositoryDrizzle(database.db);
    const now = new Date('2026-01-01T00:00:00.000Z');
    await database.db.insert(userTable).values(
      makeUserRow({
        id: 'user-1',
        name: 'Old Name',
        email: 'user@example.com',
      })
    );

    await expect(
      repository.submitOnboarding(toUserId('user-1'), {
        name: 'New Name',
        onboardedAt: now,
      })
    ).resolves.toEqual({ id: 'user-1' });

    const onboarded = await database.db.query.user.findFirst({
      where: eq(userTable.id, 'user-1'),
    });
    expect(onboarded).toMatchObject({
      name: 'New Name',
      onboardedAt: now,
    });

    await expect(
      repository.updateInfo(toUserId('user-1'), { name: 'Final Name' })
    ).resolves.toEqual({ id: 'user-1' });
    const updatedUser = await database.db.query.user.findFirst({
      where: eq(userTable.id, 'user-1'),
    });
    expect(updatedUser).toMatchObject({ name: 'Final Name' });

    await expect(
      repository.updateInfo(toUserId('missing'), { name: 'Missing' })
    ).resolves.toBeNull();
    const finalUser = await database.db.query.user.findFirst({
      where: eq(userTable.id, 'user-1'),
    });
    expect(finalUser).toMatchObject({ name: 'Final Name' });
  });
});
