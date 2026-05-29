import { describe, expect, it, vi } from 'vitest';

import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { AccountRepository } from '../ports/account-repository';
import { createAccountUseCases } from '../../factory';

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
  submitOnboarding: async (id) => ({ id }),
  updateInfo: async (id) => ({ id }),
};

const allowed: PermissionChecker = {
  hasPermission: async () => true,
};

const forbidden: PermissionChecker = {
  hasPermission: async () => false,
};

const scope = (userId: string) =>
  ({ userId: toUserId(userId), role: 'user' }) as const;

describe('account use cases', () => {
  it('submits onboarding and updates info', async () => {
    const useCases = createAccountUseCases({
      accountRepository: repository,
      clock,
      logger,
      permissionChecker: allowed,
    });

    await expect(
      useCases.submitOnboarding({
        scope: scope('user-1'),
        name: ' User ',
      })
    ).resolves.toMatchObject({ ok: true, value: { id: 'user-1' } });
    await expect(
      useCases.updateInfo({ scope: scope('user-1'), name: 'User' })
    ).resolves.toMatchObject({ ok: true, value: { id: 'user-1' } });
  });

  it('returns not_found when account rows are missing', async () => {
    const useCases = createAccountUseCases({
      accountRepository: {
        submitOnboarding: async () => null,
        updateInfo: async () => null,
      },
      clock,
      logger,
      permissionChecker: allowed,
    });

    await expect(
      useCases.submitOnboarding({
        scope: scope('missing'),
        name: 'User',
      })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
    await expect(
      useCases.updateInfo({ scope: scope('missing'), name: 'User' })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
  });

  it('rejects blank account names before repository writes', async () => {
    const repositoryWithSpies: AccountRepository = {
      submitOnboarding: async (id) => ({ id }),
      updateInfo: async (id) => ({ id }),
    };
    const submitSpy = vi.spyOn(repositoryWithSpies, 'submitOnboarding');
    const updateSpy = vi.spyOn(repositoryWithSpies, 'updateInfo');
    const useCases = createAccountUseCases({
      accountRepository: repositoryWithSpies,
      clock,
      logger,
      permissionChecker: allowed,
    });

    await expect(
      useCases.submitOnboarding({
        scope: scope('user-1'),
        name: '   ',
      })
    ).resolves.toEqual({ ok: false, reason: 'invalid' });
    await expect(
      useCases.updateInfo({ scope: scope('user-1'), name: '   ' })
    ).resolves.toEqual({ ok: false, reason: 'invalid' });
    expect(submitSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('rejects account writes without account update permission', async () => {
    const repositoryWithSpies: AccountRepository = {
      submitOnboarding: async (id) => ({ id }),
      updateInfo: async (id) => ({ id }),
    };
    const submitSpy = vi.spyOn(repositoryWithSpies, 'submitOnboarding');
    const updateSpy = vi.spyOn(repositoryWithSpies, 'updateInfo');
    const useCases = createAccountUseCases({
      accountRepository: repositoryWithSpies,
      clock,
      logger,
      permissionChecker: forbidden,
    });

    await expect(
      useCases.submitOnboarding({
        scope: scope('user-1'),
        name: 'User',
      })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
    await expect(
      useCases.updateInfo({ scope: scope('user-1'), name: 'User' })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(submitSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
