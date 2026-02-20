import { expect, Page } from '@playwright/test';
import { CustomFixture } from 'e2e/utils/types';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import {
  AUTH_EMAIL_OTP_MOCKED,
  AUTH_SIGNUP_ENABLED,
} from '@/features/auth/config';
import locales from '@/locales';
import { FileRouteTypes } from '@/routeTree.gen';

interface PageUtils {
  /**
   * Utility used to authenticate a user on the app
   */
  login: (input: { email: string; code?: string }) => Promise<void>;

  /**
   * Override of the `page.goto` method with typed routes from the app
   */
  to: (
    url: FileRouteTypes['to'],
    options?: Parameters<Page['goto']>[1]
  ) => ReturnType<Page['goto']>;
}

export type ExtendedPage = { page: PageUtils };

export const pageWithUtils: CustomFixture<Page & PageUtils> = async (
  { page },
  apply
) => {
  page.login = async function login(input: { email: string; code?: string }) {
    const routeLogin = '/login' satisfies FileRouteTypes['to'];
    const routeLoginVerify = '/login/verify' satisfies FileRouteTypes['to'];
    await page.waitForURL(`**${routeLogin}**`);

    await expect(
      page.getByText(
        locales[DEFAULT_LANGUAGE_KEY].auth[
          AUTH_SIGNUP_ENABLED ? 'pageLoginWithSignUp' : 'pageLogin'
        ].title,
        {
          exact: true,
        }
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
  };

  page.to = page.goto;

  await apply(page);
};
