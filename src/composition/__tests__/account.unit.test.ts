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

const scope = (userId: string) =>
  ({ userId: toUserId(userId), role: 'user' }) as const;

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
        scope: scope('user-1'),
        name: 'Updated User',
      })
    ).resolves.toMatchObject({ ok: true, value: { id: 'user-1' } });
    expect(updateInfo).toHaveBeenCalledWith('user-1', {
      name: 'Updated User',
    });
  });
});
