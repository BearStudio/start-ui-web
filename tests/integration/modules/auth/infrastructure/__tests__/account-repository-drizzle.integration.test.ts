import { makeUserRow } from '@tests/server/db-fixtures';
import { createPgliteTestDatabase } from '@tests/server/pglite';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createAccountRepository } from '@/modules/auth/infrastructure/drizzle/account-repository-drizzle';
import { toUserId } from '@/modules/kernel/domain/ids';
import { user as userTable } from '@/modules/kernel/infrastructure/db/schema';
import type { ApplicationResult } from '@/modules/kernel/testing';

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

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
    const repository = createAccountRepository({ db: database.db });
    const now = new Date('2026-01-01T00:00:00.000Z');
    await database.db.insert(userTable).values(
      makeUserRow({
        id: 'user-1',
        name: 'Old Name',
        email: 'user@example.com',
      })
    );

    expect(
      getOk(
        await repository.submitOnboarding(toUserId('user-1'), {
          name: 'New Name',
          onboardedAt: now,
        })
      )
    ).toEqual({ type: 'account_updated', account: { id: 'user-1' } });

    const onboarded = await database.db.query.user.findFirst({
      where: eq(userTable.id, 'user-1'),
    });
    expect(onboarded).toMatchObject({
      name: 'New Name',
      onboardedAt: now,
    });

    expect(
      getOk(
        await repository.updateInfo(toUserId('user-1'), { name: 'Final Name' })
      )
    ).toEqual({ type: 'account_updated', account: { id: 'user-1' } });
    const updatedUser = await database.db.query.user.findFirst({
      where: eq(userTable.id, 'user-1'),
    });
    expect(updatedUser).toMatchObject({ name: 'Final Name' });

    expect(
      getOk(
        await repository.updateInfo(toUserId('missing'), { name: 'Missing' })
      )
    ).toEqual({ type: 'account_not_found' });
    const finalUser = await database.db.query.user.findFirst({
      where: eq(userTable.id, 'user-1'),
    });
    expect(finalUser).toMatchObject({ name: 'Final Name' });
  });
});
