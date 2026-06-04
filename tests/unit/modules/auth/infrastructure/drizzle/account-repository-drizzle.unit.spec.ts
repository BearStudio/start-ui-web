import { describe, expect, it } from 'vitest';

import { createAccountRepository } from '@/modules/auth/infrastructure/drizzle/account-repository-drizzle';
import { toUserId } from '@/modules/kernel/domain/ids';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';
import type { ApplicationResult } from '@/modules/kernel/testing';

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

function getError<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isOk()) {
    throw new Error(`Expected Result.Error, got ${result.get().type}`);
  }
  return result.getError();
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

    const result = await repository.submitOnboarding(toUserId('user-1'), {
      name: 'User',
      onboardedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(getError(result)).toMatchObject({
      code: 'ACCOUNT_REPOSITORY_DB_ERROR',
      cause: wrappedError,
    });
  });
});
