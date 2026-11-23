import { expect, Page } from '@playwright/test';
import { CustomFixture } from 'e2e/utils/types';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import { AUTH_SIGNUP_ENABLED } from '@/features/auth/config';
import locales from '@/locales';
import { FileRouteTypes } from '@/routeTree.gen';

interface PageUtils {
  /**
   * Utility used to authenticate a user on the app
   */
  login: (input: { email: string; code?: string }) => Promise<void>;

  /**
   * Override of the `page.goto` method with typed routes from the app
   * (optionally followed by a query string)
   */
  to: (
    url: FileRouteTypes['to'] | `${FileRouteTypes['to']}?${string}`,
    options?: Parameters<Page['goto']>[1]
  ) => ReturnType<Page['goto']>;
}

const MAILDEV_URL = `http://localhost:${process.env.DOCKER_MAILDEV_UI_PORT || 1080}`;

type MaildevEmail = { to: { address: string }[]; date: string; text: string };

/**
 * Read the login code from the email the app sent, through the Maildev API.
 * The code is only mocked in dev, so this also works against a production
 * build.
 */
const readLoginCode = async (email: string, sentAfter: number) => {
  let code: string | undefined;
  await expect
    .poll(async () => {
      const response = await fetch(`${MAILDEV_URL}/email`);
      const emails = (await response.json()) as MaildevEmail[];
      // Better Auth lowercases the address before sending the code
      const recipient = email.toLowerCase();
      const latest = emails.findLast(
        (e) =>
          e.to.some((to) => to.address.toLowerCase() === recipient) &&
          new Date(e.date).getTime() >= sentAfter - 1000
      );
      code = latest?.text.match(/\b\d{6}\b/)?.[0];
      return code;
    })
    .toBeTruthy();
  return code as string;
};

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

    const sentAfter = Date.now();
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
      .fill(input.code ?? (await readLoginCode(input.email, sentAfter)));
  };

  page.to = async function to(url, options) {
    const response = await page.goto(url, options);
    // The app is server-rendered: the HTML is complete before React hydrates,
    // so a click could hit the browser's native behavior instead of a React
    // handler. Wait until React has attached itself to the DOM before going on.
    await page.waitForFunction(() =>
      Object.keys(document.documentElement).some((key) =>
        key.startsWith('__reactFiber$')
      )
    );
    return response;
  };

  await apply(page);
};
