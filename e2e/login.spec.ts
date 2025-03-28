import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, USER_EMAIL } from 'e2e/utils/constants';
import { pageUtils } from 'e2e/utils/pageUtils';

test.describe('Login flow', () => {
  test('Login as admin', async ({ page }) => {
    const utils = pageUtils(page);
    await page.goto('/login');
    await utils.login({ email: ADMIN_EMAIL });
    await page.waitForURL('/');
  });

  test('Login as user', async ({ page }) => {
    const utils = pageUtils(page);
    await page.goto('/login');
    await utils.login({ email: USER_EMAIL });
    await page.waitForURL('/');
  });

  test('Login with redirect', async ({ page }) => {
    const utils = pageUtils(page);
    await page.goto('/demo');
    await utils.login({ email: ADMIN_EMAIL });
    await page.waitForURL('/demo');
    await expect(page.getByText('/demo/')).toBeVisible();
  });
});
