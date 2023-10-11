import { Page } from '@playwright/test';

import { VALIDATION_CODE_MOCKED } from '@/features/auth/utils';
import locales from '@/locales';
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
    async login(input: RouterInput['auth']['login'] & { code?: string }) {
      await page.goto('/login');
      await page.waitForURL('**/login');

      await page.getByLabel(locales.en.auth.data.email.label).fill(input.email);
      await page
        .getByRole('button', { name: locales.en.auth.login.actions.login })
        .click();

      await page.waitForURL('**/login/**');
      await page.fill('input', input.code ?? VALIDATION_CODE_MOCKED);
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
