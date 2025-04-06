import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, USER_EMAIL } from 'e2e/utils/constants';
import { pageUtils } from 'e2e/utils/page-utils';

test.describe('Login flow', () => {
  test('Login as admin', async ({ page }) => {
    const utils = pageUtils(page);
    await page.goto('/login');
    await utils.login({ email: ADMIN_EMAIL });
    await page.waitForURL('/manager');
    await expect(page.getByTestId('layout-manager')).toBeVisible();
  });

  test('Login as user', async ({ page }) => {
    const utils = pageUtils(page);
    await page.goto('/login');
    await utils.login({ email: USER_EMAIL });
    await page.waitForURL('/app');
    await expect(page.getByTestId('layout-app')).toBeVisible();
  });

  test('Login with redirect', async ({ page }) => {
    const utils = pageUtils(page);
    await page.goto('/app');
    await utils.login({ email: ADMIN_EMAIL });
    await page.waitForURL('/app');
    await expect(page.getByTestId('layout-app')).toBeVisible();
  });
});
