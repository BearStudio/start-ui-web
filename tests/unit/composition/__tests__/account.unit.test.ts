import { Result } from '@swan-io/boxed';
import { makeTestKernel } from '@tests/unit/composition/helpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetAccountComposition,
  getAccountUseCases,
} from '@/composition/account';
import type { AccountRepository } from '@/modules/account';
import { toUserId } from '@/modules/kernel/domain/ids';
import type { ApplicationResult } from '@/modules/kernel/testing';

const makeAccountRepository = (
  overrides: Partial<AccountRepository> = {}
): AccountRepository => ({
  submitOnboarding: async (userId) =>
    Result.Ok({ type: 'account_updated', account: { id: userId } }),
  updateInfo: async (userId) =>
    Result.Ok({ type: 'account_updated', account: { id: userId } }),
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

describe('account composition', () => {
  beforeEach(() => {
    __resetAccountComposition();
  });

  it('returns a singleton with use case methods when no overrides are provided', () => {
    const first = getAccountUseCases();
    const second = getAccountUseCases();

    expect(first).toBe(second);
    expect(typeof first.updateInfo).toBe('function');
  });

  it('returns a fresh object when overrides are provided', () => {
    const singleton = getAccountUseCases();
    const overridden = getAccountUseCases({
      kernel: makeTestKernel(),
      accountRepository: makeAccountRepository(),
    });

    expect(overridden).not.toBe(singleton);
  });

  it('routes use case calls through the overridden repository', async () => {
    const updateInfo = vi.fn(async (userId) =>
      Result.Ok({ type: 'account_updated' as const, account: { id: userId } })
    );
    const useCases = getAccountUseCases({
      kernel: makeTestKernel(),
      accountRepository: makeAccountRepository({ updateInfo }),
    });

    const result = await useCases.updateInfo({
      currentUserId: scope('user-1').userId,
      name: 'Updated User',
    });

    expect(getOk(result)).toEqual({
      type: 'account_updated',
      account: { id: 'user-1' },
    });
    expect(updateInfo).toHaveBeenCalledWith('user-1', {
      name: 'Updated User',
    });
  });
});
