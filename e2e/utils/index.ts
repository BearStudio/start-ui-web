import { Page } from '@playwright/test';

import { ADMIN_PATH } from '@/features/admin/constants';
import { APP_PATH } from '@/features/app/constants';
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
     * Utility used to authenticate a user on the app
     */
    async login(input: RouterInput['auth']['login'] & { code?: string }) {
      await page.goto(`${APP_PATH}/login`);
      await page.waitForURL(`**${APP_PATH}/login`);

      await page.getByLabel(locales.en.auth.data.email.label).fill(input.email);
      await page
        .getByRole('button', { name: locales.en.auth.login.actions.login })
        .click();

      await page.waitForURL(`**${APP_PATH}/login/**`);
      await page.fill('input', input.code ?? VALIDATION_CODE_MOCKED);
    },

    /**
     * Utility used to authenticate an admin on the app
     */
    async loginAdmin(input: RouterInput['auth']['login'] & { code?: string }) {
      await page.goto(`${ADMIN_PATH}/login`);
      await page.waitForURL(`**${ADMIN_PATH}/login`);

      await page.getByLabel(locales.en.auth.data.email.label).fill(input.email);
      await page
        .getByRole('button', { name: locales.en.auth.login.actions.login })
        .click();

      await page.waitForURL(`**${ADMIN_PATH}/login/**`);
      await page.fill('input', input.code ?? VALIDATION_CODE_MOCKED);
    },
  } as const;
};
