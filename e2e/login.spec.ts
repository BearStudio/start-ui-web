import { expect, test } from '@playwright/test';
import { getUtils } from 'e2e/utils';
import { randomUUID } from 'node:crypto';

import locales from '@/locales';

test.describe('Login flow', () => {
  test('Login as admin', async ({ page }) => {
    const utils = getUtils(page);

    await utils.loginAdmin({ email: 'admin@admin.com' });

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).not.toBeVisible();
  });

  test('Login as user', async ({ page }) => {
    const utils = getUtils(page);

    await utils.loginApp({ email: 'user@user.com' });

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).not.toBeVisible();
  });

  test('Login with a wrong code', async ({ page }) => {
    const utils = getUtils(page);

    await utils.loginApp({ email: 'user@user.com', code: '111111' });

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).toBeVisible();
  });

  test('Login with a wrong email', async ({ page }) => {
    const utils = getUtils(page);

    const randomId = await randomUUID();
    const email = `${randomId}@example.com`;

    await utils.loginApp({ email });

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).toBeVisible();
  });
});
