import { Page } from '@playwright/test';

import { VALIDATION_CODE_MOCKED } from '@/features/auth/utils';
import { RouterInput } from '@/server/router';

/**
 * Utilities constructor
 *
 * @example
 * ```ts
 * test.describe('My scope', () => {
 *   test('My test', async ({ page }) => {
 *     const utils = getUtils(page);
 *
 *     // No need too pass page on each util
 *     await utils.login(...)
 *   })
 * })
 * ```
 */
export const getUtils = (page: Page) => {
  return {
    /**
     * Utility used to authenticate the user on the app
     */
    async login(input: RouterInput['auth']['login']) {
      await page.goto('/login');
      await page.waitForURL('**/login');

      await page.getByLabel('Email').fill(input.email);
      await page.getByRole('button', { name: 'Sign In' }).click();

      await page.waitForURL('**/login/**');
      await page.fill('input', VALIDATION_CODE_MOCKED);
    },
    async loginAsAdmin() {
      return this.login({
        email: 'admin@admin.com',
      });
    },
    async loginAsUser() {
      return this.login({
        email: 'user@user.com',
      });
    },
  } as const;
};
