import { expect, test } from '@playwright/test';
import { pageUtils } from 'e2e/utils/pageUtils';
import { USER_EMAIL, getRandomEmail } from 'e2e/utils/users';

import { APP_PATH } from '@/features/app/constants';
import { VALIDATION_CODE_MOCKED } from '@/features/auth/utils';
import locales from '@/locales';

test.describe('Register flow', () => {
  test('Success flow', async ({ page }) => {
    await page.goto(`${APP_PATH}/register`);
    await page.waitForURL(`**${APP_PATH}/register`);

    await page.getByLabel('Name').fill('Test user');
    const email = await getRandomEmail();
    await page.getByLabel('Email').fill(email);
    await page
      .getByRole('button', { name: locales.en.auth.register.actions.create })
      .click();

    await page.waitForURL(`**${APP_PATH}/register/**`);
    await page.fill('input', VALIDATION_CODE_MOCKED);

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).not.toBeVisible();
  });

  test('Register with existing email', async ({ page }) => {
    await page.goto(`${APP_PATH}/register`);
    await page.waitForURL(`**${APP_PATH}/register`);

    await page.getByLabel('Name').fill('Test user');
    await page.getByLabel('Email').fill(USER_EMAIL);
    await page
      .getByRole('button', { name: locales.en.auth.register.actions.create })
      .click();

    await page.waitForURL(`**${APP_PATH}/register/**`);
    await page.fill('input', VALIDATION_CODE_MOCKED);

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).toBeVisible();
  });

  test('Login with a not verified account', async ({ page }) => {
    const utils = pageUtils(page);
    await page.goto(`${APP_PATH}/register`);
    await page.waitForURL(`**${APP_PATH}/register`);

    const email = await getRandomEmail();

    await page.getByLabel('Name').fill('Test user');
    await page.getByLabel('Email').fill(email);
    await page
      .getByRole('button', { name: locales.en.auth.register.actions.create })
      .click();

    await utils.loginApp({ email });

    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).toBeVisible();
  });
});
