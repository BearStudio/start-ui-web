import type { Locator, Page } from '@playwright/test';
import { expect, test } from 'e2e/utils';
import {
  ADMIN_EMAIL,
  ADMIN_FILE,
  USER_EMAIL,
  USER_FILE,
} from 'e2e/utils/constants';
import path from 'node:path';

const screenshotStylePath = path.join(
  import.meta.dirname,
  'visual-screenshot.css'
);

const screenshot = async (
  page: Page,
  name: string,
  options: { mask?: Locator[] } = {}
) => {
  await expect(page).toHaveScreenshot(name, {
    animations: 'disabled',
    fullPage: true,
    stylePath: screenshotStylePath,
    ...options,
  });
};

test.describe('Visual regression coverage', () => {
  test.describe.configure({ timeout: 60_000 });

  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Local visual baselines are intentionally kept to Chromium on the developer machine.'
  );

  test.use({ viewport: { width: 1280, height: 900 } });

  test('login and verification screens remain visually stable', async ({
    page,
  }) => {
    await page.to('/login');
    await expect(page.getByTestId('auth-login-form')).toHaveAttribute(
      'data-hydrated',
      'true'
    );
    await screenshot(page, 'login-page.png');

    await page.getByPlaceholder('Email').fill(USER_EMAIL);
    await page
      .getByRole('button', { name: /continue with email|login with email/i })
      .click();
    await page.waitForURL('**/login/verify**');
    await expect(page.getByTestId('auth-login-verify-form')).toHaveAttribute(
      'data-hydrated',
      'true'
    );
    await screenshot(page, 'login-verify-page.png');
  });

  test.describe('authenticated app screens', () => {
    test.use({ storageState: USER_FILE });

    test('app shell remains visually stable', async ({ page }) => {
      await page.to('/app');
      await expect(page.getByTestId('layout-app')).toBeVisible();
      await screenshot(page, 'authenticated-app-shell.png');
    });
  });

  test.describe('manager user screens', () => {
    test.use({ storageState: ADMIN_FILE });

    test('list, create, edit, and delete confirmation remain visually stable', async ({
      page,
    }) => {
      await page.goto(
        `/manager/users?searchTerm=${encodeURIComponent(ADMIN_EMAIL)}`
      );
      await expect(page.getByText(ADMIN_EMAIL, { exact: true })).toBeVisible();
      await screenshot(page, 'manager-users-list.png', {
        mask: [page.getByText(/ago|Not onboarded/i)],
      });

      await page.getByRole('link', { name: /new/i }).click();
      await page.waitForURL('**/manager/users/new');
      await expect(page.getByTestId('manager-user-new-form')).toHaveAttribute(
        'data-hydrated',
        'true'
      );
      await screenshot(page, 'manager-user-create.png');

      await page.to('/manager/users');
      await page.getByText(ADMIN_EMAIL, { exact: true }).click({
        force: true,
      });
      await page.getByRole('link', { name: /edit user/i }).click();
      await page.waitForURL('**/manager/users/**/update');
      await expect(page.getByLabel('Email')).toHaveValue(ADMIN_EMAIL);
      await screenshot(page, 'manager-user-edit.png');

      await page.goto(
        `/manager/users?searchTerm=${encodeURIComponent(USER_EMAIL)}`
      );
      await page.getByText(USER_EMAIL, { exact: true }).click({
        force: true,
      });
      await expect(page.getByText(USER_EMAIL, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: /delete/i }).click();
      await expect(
        page.getByRole('dialog', { name: /delete user/i })
      ).toBeVisible();
      await screenshot(page, 'manager-user-delete-confirmation.png', {
        mask: [page.getByText(/ago|Not onboarded/i)],
      });
    });
  });
});
