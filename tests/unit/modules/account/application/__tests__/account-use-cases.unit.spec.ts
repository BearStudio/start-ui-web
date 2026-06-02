import { Result } from '@swan-io/boxed';
import { describe, expect, it, vi } from 'vitest';

import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { ApplicationResult } from '@/modules/kernel/testing';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { AccountRepository } from '@/modules/account/application/ports/account-repository';
import { createAccountUseCases } from '@/modules/account/factory';

const logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

const clock = {
  now: () => new Date('2026-01-01T00:00:00.000Z'),
};

const repository: AccountRepository = {
  submitOnboarding: async (id) =>
    Result.Ok({ type: 'account_updated', account: { id } }),
  updateInfo: async (id) =>
    Result.Ok({ type: 'account_updated', account: { id } }),
};

const allowed: PermissionChecker = {
  hasPermission: async () => Result.Ok({ type: 'permission_granted' }),
};

const forbidden: PermissionChecker = {
  hasPermission: async () => Result.Ok({ type: 'permission_denied' }),
};

const scope = (userId: string) =>
  ({ userId: toUserId(userId), role: 'user' }) as const;

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('account use cases', () => {
  it('submits onboarding and updates info', async () => {
    const useCases = createAccountUseCases({
      accountRepository: repository,
      clock,
      logger,
      permissionChecker: allowed,
    });

    const submitted = await useCases.submitOnboarding({
      currentUserId: scope('user-1').userId,
      name: ' User ',
    });
    const updated = await useCases.updateInfo({
      currentUserId: scope('user-1').userId,
      name: 'User',
    });

    expect(getOk(submitted)).toEqual({
      type: 'account_updated',
      account: { id: 'user-1' },
    });
    expect(getOk(updated)).toEqual({
      type: 'account_updated',
      account: { id: 'user-1' },
    });
  });

  it('returns not_found when account rows are missing', async () => {
    const useCases = createAccountUseCases({
      accountRepository: {
        submitOnboarding: async () => Result.Ok({ type: 'account_not_found' }),
        updateInfo: async () => Result.Ok({ type: 'account_not_found' }),
      },
      clock,
      logger,
      permissionChecker: allowed,
    });

    const submitted = await useCases.submitOnboarding({
      currentUserId: scope('missing').userId,
      name: 'User',
    });
    const updated = await useCases.updateInfo({
      currentUserId: scope('missing').userId,
      name: 'User',
    });

    expect(getOk(submitted)).toEqual({ type: 'account_not_found' });
    expect(getOk(updated)).toEqual({ type: 'account_not_found' });
  });

  it('rejects blank account names before repository writes', async () => {
    const repositoryWithSpies: AccountRepository = {
      submitOnboarding: async (id) =>
        Result.Ok({ type: 'account_updated', account: { id } }),
      updateInfo: async (id) =>
        Result.Ok({ type: 'account_updated', account: { id } }),
    };
    const submitSpy = vi.spyOn(repositoryWithSpies, 'submitOnboarding');
    const updateSpy = vi.spyOn(repositoryWithSpies, 'updateInfo');
    const useCases = createAccountUseCases({
      accountRepository: repositoryWithSpies,
      clock,
      logger,
      permissionChecker: allowed,
    });

    const submitted = await useCases.submitOnboarding({
      currentUserId: scope('user-1').userId,
      name: '   ',
    });
    const updated = await useCases.updateInfo({
      currentUserId: scope('user-1').userId,
      name: '   ',
    });

    expect(getOk(submitted)).toEqual({ type: 'account_invalid' });
    expect(getOk(updated)).toEqual({ type: 'account_invalid' });
    expect(submitSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('rejects account writes without account update permission', async () => {
    const repositoryWithSpies: AccountRepository = {
      submitOnboarding: async (id) =>
        Result.Ok({ type: 'account_updated', account: { id } }),
      updateInfo: async (id) =>
        Result.Ok({ type: 'account_updated', account: { id } }),
    };
    const submitSpy = vi.spyOn(repositoryWithSpies, 'submitOnboarding');
    const updateSpy = vi.spyOn(repositoryWithSpies, 'updateInfo');
    const useCases = createAccountUseCases({
      accountRepository: repositoryWithSpies,
      clock,
      logger,
      permissionChecker: forbidden,
    });

    const submitted = await useCases.submitOnboarding({
      currentUserId: scope('user-1').userId,
      name: 'User',
    });
    const updated = await useCases.updateInfo({
      currentUserId: scope('user-1').userId,
      name: 'User',
    });

    expect(getOk(submitted)).toEqual({ type: 'account_forbidden' });
    expect(getOk(updated)).toEqual({ type: 'account_forbidden' });
    expect(submitSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
