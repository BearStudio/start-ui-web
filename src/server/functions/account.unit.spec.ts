import { describe, expect, it } from 'vitest';

import { handlers } from '@/server/functions/account.handlers.server';
import {
  chainResult,
  createAuthenticatedContext,
  mockDb,
  mockUserHasPermission,
} from '@/server/functions/test-utils';

describe('account handlers', () => {
  describe('submitOnboarding', () => {
    const onboardingInput = { name: 'Test User' };

    it('should update the user with onboarding data', async () => {
      mockDb.update.mockReturnValueOnce(chainResult([{ id: 'user-1' }]));

      await handlers.submitOnboarding(
        createAuthenticatedContext(),
        onboardingInput
      );

      const updateChain = mockDb.update.mock.results[0]?.value;
      expect(updateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test User',
          onboardedAt: expect.any(Date),
        })
      );
    });

    it('should throw NOT_FOUND when no user was updated', async () => {
      mockDb.update.mockReturnValueOnce(chainResult([]));

      await expect(
        handlers.submitOnboarding(createAuthenticatedContext(), onboardingInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should not require any specific permission', async () => {
      mockDb.update.mockReturnValueOnce(chainResult([{ id: 'user-1' }]));

      await handlers.submitOnboarding(
        createAuthenticatedContext(),
        onboardingInput
      );

      expect(mockUserHasPermission).not.toHaveBeenCalled();
    });
  });

  describe('updateInfo', () => {
    const updateInput = { name: 'Updated Name' };

    it('should update the user name', async () => {
      mockDb.update.mockReturnValueOnce(chainResult([{ id: 'user-1' }]));

      await handlers.updateInfo(createAuthenticatedContext(), updateInput);

      const updateChain = mockDb.update.mock.results[0]?.value;
      expect(updateChain.set).toHaveBeenCalledWith({
        name: 'Updated Name',
      });
    });

    it('should throw NOT_FOUND when no user was updated', async () => {
      mockDb.update.mockReturnValueOnce(chainResult([]));

      await expect(
        handlers.updateInfo(createAuthenticatedContext(), updateInput)
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should not require any specific permission', async () => {
      mockDb.update.mockReturnValueOnce(chainResult([{ id: 'user-1' }]));

      await handlers.updateInfo(createAuthenticatedContext(), updateInput);

      expect(mockUserHasPermission).not.toHaveBeenCalled();
    });
  });
});
