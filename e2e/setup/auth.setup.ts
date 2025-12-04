import { expect } from '@playwright/test';
import { test as setup } from 'e2e/utils';
import {
  ADMIN_EMAIL,
  ADMIN_FILE,
  USER_EMAIL,
  USER_FILE,
} from 'e2e/utils/constants';

/**
 * @see https://playwright.dev/docs/auth#multiple-signed-in-roles
 */

setup('authenticate as admin', async ({ page }) => {
  await page.to('/login');
  await page.login({ email: ADMIN_EMAIL });

  await page.waitForURL('/manager');
  await expect(page.getByTestId('layout-manager')).toBeVisible();

  await page.context().storageState({ path: ADMIN_FILE });
});

setup('authenticate as user', async ({ page }) => {
  await page.to('/login');
  await page.login({ email: USER_EMAIL });

  await page.waitForURL('/app');
  await expect(page.getByTestId('layout-app')).toBeVisible();

  await page.context().storageState({ path: USER_FILE });
});
