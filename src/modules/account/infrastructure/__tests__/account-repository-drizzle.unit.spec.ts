import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { toUserId } from '@/modules/kernel/domain/ids';
import { user as userTable } from '@/modules/kernel/infrastructure/db/schema';
import { createPgliteTestDb } from '@/tests/server/pglite';

import { AccountRepositoryDrizzle } from '../drizzle/account-repository-drizzle';

describe('AccountRepositoryDrizzle integration', () => {
  it('covers account update behavior with PGlite', async () => {
    const { client, db } = await createPgliteTestDb();
    try {
      const repository = new AccountRepositoryDrizzle(db);
      const now = new Date('2026-01-01T00:00:00.000Z');
      await db.insert(userTable).values({
        id: 'user-1',
        name: 'Old Name',
        email: 'user@example.com',
        emailVerified: true,
        role: 'user',
      });

      await expect(
        repository.submitOnboarding(toUserId('user-1'), {
          name: 'New Name',
          onboardedAt: now,
        })
      ).resolves.toEqual({ id: 'user-1' });

      const onboarded = await db.query.user.findFirst({
        where: eq(userTable.id, 'user-1'),
      });
      expect(onboarded).toMatchObject({
        name: 'New Name',
        onboardedAt: now,
      });

      await expect(
        repository.updateInfo(toUserId('user-1'), { name: 'Final Name' })
      ).resolves.toEqual({ id: 'user-1' });
      await expect(
        repository.updateInfo(toUserId('missing'), { name: 'Missing' })
      ).resolves.toBeNull();
    } finally {
      await client.close();
    }
  });
});
