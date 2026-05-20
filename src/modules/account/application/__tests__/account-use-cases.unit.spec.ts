import { describe, expect, it } from 'vitest';

import { toUserId } from '@/modules/kernel/domain/ids';

import type { AccountRepository } from '../ports/account-repository';
import { createAccountUseCases } from '../../factory';

const logger = {
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

describe('account use cases', () => {
  it('submits onboarding and updates info', async () => {
    const useCases = createAccountUseCases({
      accountRepository: repository,
      clock,
      logger,
    });

    await expect(
      useCases.submitOnboarding({
        currentUserId: toUserId('user-1'),
        name: ' User ',
      })
    ).resolves.toMatchObject({ ok: true, value: { id: 'user-1' } });
    await expect(
      useCases.updateInfo({ currentUserId: toUserId('user-1'), name: 'User' })
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
    });

    await expect(
      useCases.submitOnboarding({
        currentUserId: toUserId('missing'),
        name: 'User',
      })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
    await expect(
      useCases.updateInfo({ currentUserId: toUserId('missing'), name: 'User' })
    ).resolves.toEqual({ ok: false, reason: 'not_found' });
  });
});
