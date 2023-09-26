import { Page } from '@playwright/test';

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
    async login(userDetails: { email: string; password: string }) {
      await page.goto('/login');
      await page.waitForURL('**/login');

      await page.getByLabel('Email').fill(userDetails.email);
      await page.getByLabel(/^Password/).fill(userDetails.password);

      await page.getByRole('button', { name: 'Log In' }).click();
    },
    async loginAsAdmin() {
      return this.login({
        email: 'admin@admin.com',
        password: 'admin',
      });
    },
    async loginAsUser() {
      return this.login({
        email: 'user@user.com',
        password: 'user',
      });
    },
  } as const;
};
