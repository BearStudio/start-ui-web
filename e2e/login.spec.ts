import { expect, test } from '@playwright/test';
import { pageUtils } from 'e2e/utils/pageUtils';
import { ADMIN_EMAIL, USER_EMAIL, getRandomEmail } from 'e2e/utils/users';

import locales from '@/locales';

test.describe('Login flow', () => {
  test('Login as admin', async ({ page }) => {
    const utils = pageUtils(page);

    await utils.loginAdmin({ email: ADMIN_EMAIL });

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).not.toBeVisible();
  });

  test('Login as user', async ({ page }) => {
    const utils = pageUtils(page);

    await utils.loginApp({ email: USER_EMAIL });

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).not.toBeVisible();
  });

  test('Login with a wrong code', async ({ page }) => {
    const utils = pageUtils(page);

    await utils.loginApp({ email: USER_EMAIL, code: '111111' });

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).toBeVisible();
  });

  test('Login with a wrong email', async ({ page }) => {
    const utils = pageUtils(page);

    const email = await getRandomEmail();
    await utils.loginApp({ email });

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).toBeVisible();
  });
});
