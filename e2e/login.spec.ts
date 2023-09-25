import { expect, test } from '@playwright/test';
import { getUtils } from 'e2e/utils';

test.describe('Authentication flow', () => {
  test('Login as admin', async ({ page }) => {
    const utils = getUtils(page);

    await utils.loginAsAdmin();

    await expect(
      page.getByRole('heading', { name: 'Dashboard', level: 2 })
    ).toBeVisible();

    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('Login as user', async ({ page }) => {
    const utils = getUtils(page);

    await utils.loginAsUser();

    await expect(
      page.getByRole('heading', { name: 'Dashboard', level: 2 })
    ).toBeVisible();

    await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
  });
});
