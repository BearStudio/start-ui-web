import { describe, expect, it } from 'vitest';

import { toUserId } from '@/modules/kernel/domain/ids';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';

import { createAccountRepository } from '@/modules/auth/infrastructure/drizzle/account-repository-drizzle';

function makeThrowingDb(error: unknown): DbLike {
  return {
    update: () => ({
      set: () => ({
        where: () => ({
          returning: async () => {
            throw error;
          },
        }),
      }),
    }),
  } as unknown as DbLike;
}

describe('AccountRepositoryDrizzle', () => {
  it('maps wrapped database errors to account repository database errors', async () => {
    const databaseError = Object.assign(new Error('duplicate key value'), {
      code: '23505',
      constraint: 'user_email_key',
      severity: 'ERROR',
    });
    const wrappedError = new Error('Failed query');
    wrappedError.cause = databaseError;

    const repository = createAccountRepository({
      db: makeThrowingDb(wrappedError),
    });

    await expect(
      repository.submitOnboarding(toUserId('user-1'), {
        name: 'User',
        onboardedAt: new Date('2026-01-01T00:00:00.000Z'),
      })
    ).rejects.toMatchObject({
      code: 'ACCOUNT_REPOSITORY_DB_ERROR',
      cause: wrappedError,
    });
  });
});
