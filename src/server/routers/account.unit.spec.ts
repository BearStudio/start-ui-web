import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';

import accountRouter from '@/server/routers/account';
import {
  mockGetSession,
  mockUserHasPermission,
} from '@/server/routers/test-utils';

describe('account router', () => {
  describe('submitOnboarding', () => {
    const onboardingInput = { name: 'Test User' };

    it('should succeed for an authenticated user', async () => {
      await expect(
        call(accountRouter.submitOnboarding, onboardingInput)
      ).resolves.toBeUndefined();
    });

    it('should not require any specific permission', async () => {
      await call(accountRouter.submitOnboarding, onboardingInput);

      expect(mockUserHasPermission).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(accountRouter.submitOnboarding, onboardingInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('updateInfo', () => {
    const updateInput = { name: 'Updated Name' };

    it('should succeed for an authenticated user', async () => {
      await expect(
        call(accountRouter.updateInfo, updateInput)
      ).resolves.toBeUndefined();
    });

    it('should not require any specific permission', async () => {
      await call(accountRouter.updateInfo, updateInput);

      expect(mockUserHasPermission).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        call(accountRouter.updateInfo, updateInput)
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });
});
