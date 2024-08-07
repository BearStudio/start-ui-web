import { expect, test } from '@playwright/test';
import { pageUtils } from 'e2e/utils/pageUtils';
import { USER_EMAIL, getRandomEmail } from 'e2e/utils/users';

import { ROUTES_AUTH } from '@/features/auth/routes';
import { VALIDATION_CODE_MOCKED } from '@/features/auth/utils';
import locales from '@/locales';

test.describe('Register flow', () => {
  test('Success flow', async ({ page }) => {
    await page.goto(ROUTES_AUTH.register());
    await page.waitForURL(`**${ROUTES_AUTH.register()}`);

    await page.getByLabel('Name').fill('Test user');
    const email = await getRandomEmail();
    await page.getByLabel('Email').fill(email);
    await page
      .getByRole('button', { name: locales.en.auth.register.actions.create })
      .click();

    await page.waitForURL(`**${ROUTES_AUTH.register()}/**`);
    await page.getByText('Verification code').fill(VALIDATION_CODE_MOCKED);
    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).not.toBeVisible();
  });

  test('Register with existing email', async ({ page }) => {
    await page.goto(ROUTES_AUTH.register());
    await page.waitForURL(`**${ROUTES_AUTH.register()}`);

    await page.getByLabel('Name').fill('Test user');
    await page.getByLabel('Email').fill(USER_EMAIL);
    await page
      .getByRole('button', { name: locales.en.auth.register.actions.create })
      .click();

    await page.waitForURL(`**${ROUTES_AUTH.register()}/**`);
    await page.getByText('Verification code').fill(VALIDATION_CODE_MOCKED);
    await expect(
      page.getByText(locales.en.auth.data.verificationCode.unknown)
    ).toBeVisible();
  });

  test('Login with a not verified account', async ({ page }) => {
    const utils = pageUtils(page);
    await page.goto(ROUTES_AUTH.register());
    await page.waitForURL(`**${ROUTES_AUTH.register()}`);

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
