import { expect, Page } from '@playwright/test';

import {
  AUTH_EMAIL_OTP_MOCKED,
  AUTH_SIGNUP_ENABLED,
} from '@/features/auth/config';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import locales from '@/locales';
import { FileRouteTypes } from '@/routeTree.gen';

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
    async login(input: { email: string; code?: string }) {
      const routeLogin = '/login' satisfies FileRouteTypes['to'];
      const routeLoginVerify = '/login/verify' satisfies FileRouteTypes['to'];
      await page.waitForURL(`**${routeLogin}**`);

      await expect(
        page.getByText(
          locales[DEFAULT_LANGUAGE_KEY].auth.pageLoginWithSignUp.title
        )
      ).toBeVisible();

      await page
        .getByPlaceholder(locales[DEFAULT_LANGUAGE_KEY].auth.common.email.label)
        .fill(input.email);

      await page
        .getByRole('button', {
          name: locales[DEFAULT_LANGUAGE_KEY].auth[
            AUTH_SIGNUP_ENABLED ? 'pageLoginWithSignUp' : 'pageLogin'
          ].loginWithEmail,
        })
        .click();

      await page.waitForURL(`**${routeLoginVerify}**`);
      await page
        .getByText(locales[DEFAULT_LANGUAGE_KEY].auth.common.otp.label)
        .fill(input.code ?? AUTH_EMAIL_OTP_MOCKED);
    },
  } as const;
};
