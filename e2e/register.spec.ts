import { expect, test } from '@playwright/test';
import { getUtils } from 'e2e/utils';
import { randomUUID } from 'node:crypto';

import { VALIDATION_CODE_MOCKED } from '@/features/auth/utils';
import locales from '@/locales';

test.describe('Register flow', () => {
  test('Success flow', async ({ page }) => {
    await page.goto('/register');
    await page.waitForURL('**/register');

    await page.getByLabel('Name').fill('Test user');
    const randomId = await randomUUID();
    await page.getByLabel('Email').fill(`${randomId}@example.com`);
    await page
      .getByRole('button', { name: locales.en.auth.register.actions.create })
      .click();

    await page.waitForURL('**/register/**');
    await page.fill('input', VALIDATION_CODE_MOCKED);

    await expect(
      page.getByRole('heading', { name: locales.en.dashboard.title, level: 2 })
    ).toBeVisible();

    await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
  });

  test('Register with existing email', async ({ page }) => {
    await page.goto('/register');
    await page.waitForURL('**/register');

    await page.getByLabel('Name').fill('Test user');
    await page.getByLabel('Email').fill(`user@user.com`);
    await page
      .getByRole('button', { name: locales.en.auth.register.actions.create })
      .click();

    await page.waitForURL('**/register/**');
    await page.fill('input', VALIDATION_CODE_MOCKED);

    await expect(page.getByText('Code is invalid')).toBeVisible();
  });

  test('Login with a not verified account', async ({ page }) => {
    const utils = getUtils(page);
    await page.goto('/register');
    await page.waitForURL('**/register');

    const randomId = await randomUUID();
    const email = `${randomId}@example.com`;

    await page.getByLabel('Name').fill('Test user');
    await page.getByLabel('Email').fill(email);
    await page
      .getByRole('button', { name: locales.en.auth.register.actions.create })
      .click();

    await utils.login({ email });

    await expect(page.getByText('Code is invalid')).toBeVisible();
  });
});
