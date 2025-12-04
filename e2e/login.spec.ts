import { expect, test } from 'e2e/utils';
import { ADMIN_EMAIL, USER_EMAIL } from 'e2e/utils/constants';

test.describe('Login flow', () => {
  test('Login as admin', async ({ page }) => {
    await page.to('/login');
    await page.login({ email: ADMIN_EMAIL });
    await page.waitForURL('/manager');
    await expect(page.getByTestId('layout-manager')).toBeVisible();
  });

  test('Login as user', async ({ page }) => {
    await page.to('/login');
    await page.login({ email: USER_EMAIL });
    await page.waitForURL('/app');
    await expect(page.getByTestId('layout-app')).toBeVisible();
  });

  test('Login with redirect', async ({ page }) => {
    await page.to('/app');
    await page.login({ email: ADMIN_EMAIL });
    await page.waitForURL('/app');
    await expect(page.getByTestId('layout-app')).toBeVisible();
  });
});
