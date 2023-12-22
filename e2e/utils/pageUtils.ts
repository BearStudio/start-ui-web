import { Page } from '@playwright/test';

import { ADMIN_PATH } from '@/features/admin/constants';
import { APP_PATH } from '@/features/app/constants';
import { VALIDATION_CODE_MOCKED } from '@/features/auth/utils';
import type { RouterInputs } from '@/lib/trpc/types';
import locales from '@/locales';

/**
 * Utilities constructor
 *
 * @example
 * ```ts
 * test.describe('My scope', () => {
 *   test('My test', async ({ page }) => {
 *     const utils = pageUtils(page);
 *
 *     // No need too pass page on each util
 *     await utils.login(...)
 *   })
 * })
 * ```
 */
export const pageUtils = (page: Page) => {
  return {
    /**
     * Utility used to authenticate a user on the app
     */
    async loginApp(input: RouterInputs['auth']['login'] & { code?: string }) {
      await page.goto(`${APP_PATH}/login`);
      await page.waitForURL(`**${APP_PATH}/login`);

      await page
        .getByPlaceholder(locales.en.auth.data.email.label)
        .fill(input.email);
      await page
        .getByRole('button', { name: locales.en.auth.login.actions.login })
        .click();

      await page.waitForURL(`**${APP_PATH}/login/**`);
      await page.fill('input', input.code ?? VALIDATION_CODE_MOCKED);
    },

    /**
     * Utility used to authenticate an admin on the app
     */
    async loginAdmin(input: RouterInputs['auth']['login'] & { code?: string }) {
      await page.goto(`${ADMIN_PATH}/login`);
      await page.waitForURL(`**${ADMIN_PATH}/login`);

      await page
        .getByPlaceholder(locales.en.auth.data.email.label)
        .fill(input.email);
      await page
        .getByRole('button', { name: locales.en.auth.login.actions.login })
        .click();

      await page.waitForURL(`**${ADMIN_PATH}/login/**`);
      await page.fill('input', input.code ?? VALIDATION_CODE_MOCKED);
    },
  } as const;
};
