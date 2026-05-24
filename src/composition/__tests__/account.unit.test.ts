import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AccountRepository } from '@/modules/account';
import { toUserId } from '@/modules/kernel/domain/ids';

import { makeTestKernel } from './helpers';
import { __resetAccountComposition, getAccountUseCases } from '../account';

const makeAccountRepository = (
  overrides: Partial<AccountRepository> = {}
): AccountRepository => ({
  submitOnboarding: async (userId) => ({ id: userId }),
  updateInfo: async (userId) => ({ id: userId }),
  ...overrides,
});

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
    const updateInfo = vi.fn(async (userId) => ({ id: userId }));
    const useCases = getAccountUseCases({
      kernel: makeTestKernel(),
      accountRepository: makeAccountRepository({ updateInfo }),
    });

    await expect(
      useCases.updateInfo({
        currentUserId: toUserId('user-1'),
        name: 'Updated User',
      })
    ).resolves.toMatchObject({ ok: true, value: { id: toUserId('user-1') } });
    expect(updateInfo).toHaveBeenCalledWith(toUserId('user-1'), {
      name: 'Updated User',
    });
  });
});
