import type { Page } from '@playwright/test';
import { expect, test } from 'e2e/utils';
import { ADMIN_FILE, USER_FILE } from 'e2e/utils/constants';
import { randomString } from 'remeda';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import { AUTH_EMAIL_OTP_MOCKED } from '@/features/auth/config';
import locales from '@/locales';

const t = locales[DEFAULT_LANGUAGE_KEY];

const deleteManagedUser = async (page: Page) => {
  await page
    .getByRole('button', { name: t.user.manager.detail.deleteButton.label })
    .click();

  await expect(
    page.getByText(t.user.manager.detail.confirmDeleteDescription)
  ).toBeVisible();

  await page
    .getByRole('button', { name: t.user.manager.detail.deleteButton.label })
    .click();

  await expect(page.getByText(t.user.manager.detail.userDeleted)).toBeVisible();
};

test.describe('User management as user', () => {
  test.use({ storageState: USER_FILE });

  test('Should not have access', async ({ page }) => {
    await page.to('/manager/users');

    await expect(
      page.getByText(t.components.pageError[403].message)
    ).toBeVisible();
  });
});

test.describe('User management as manager', () => {
  test.use({ storageState: ADMIN_FILE });

  test.beforeEach(async ({ page }) => {
    await page.to('/manager/users');
  });

  const createManagedUser = async (
    page: Page,
    input: { name: string; email: string }
  ) => {
    await page.getByText(t.user.manager.list.newButton).click();
    await page.waitForURL('/manager/users/new');
    await page.getByLabel(t.user.common.name.label).fill(input.name);
    await page.getByLabel(t.user.common.email.label).fill(input.email);
    await page.getByText(t.user.manager.new.createButton.label).click();
    await page.waitForURL('/manager/users');
    await page
      .getByPlaceholder(t.components.searchInput.placeholder)
      .fill(input.email);
    await page.getByRole('link', { name: input.name }).click();
  };

  test('Create a user', async ({ page }) => {
    await page.getByText(t.user.manager.list.newButton).click();

    const randomId = randomString(8);
    const uniqueEmail = `new-user-${randomId}@user.com`;
    const uniqueName = `New user ${randomId}`;

    // Fill the form
    await page.waitForURL('/manager/users/new');
    await page.getByLabel(t.user.common.name.label).fill(uniqueName);
    await page.getByLabel(t.user.common.email.label).fill(uniqueEmail);
    await page.getByText(t.user.manager.new.createButton.label).click();

    await page.waitForURL('/manager/users');
    await page
      .getByPlaceholder(t.components.searchInput.placeholder)
      .fill(`new-user-${randomId}`);
    await expect(page.getByText(uniqueEmail)).toBeVisible();

    await page.getByRole('link', { name: uniqueName }).click();
    await deleteManagedUser(page);
  });

  test('Edit a user', async ({ page }) => {
    const randomId = randomString(8);
    const uniqueEmail = `edit-user-${randomId}@user.com`;
    await createManagedUser(page, {
      name: `Editable User ${randomId}`,
      email: uniqueEmail,
    });

    await page
      .getByRole('link', { name: t.user.manager.detail.editUser })
      .click();

    const newAdminName = `Admin ${randomId}`;
    await page.getByLabel(t.user.common.name.label).fill(newAdminName);
    await page.getByText(t.user.manager.update.updateButton.label).click();

    await expect(
      page.locator('main').getByText(newAdminName).first()
    ).toBeVisible();

    await deleteManagedUser(page);
  });

  test('Delete a user', async ({ page }) => {
    const randomId = randomString(8);
    const uniqueEmail = `delete-user-${randomId}@user.com`;
    const uniqueName = `Delete User ${randomId}`;

    await createManagedUser(page, {
      name: uniqueName,
      email: uniqueEmail,
    });
    await deleteManagedUser(page);

    await page
      .getByPlaceholder(t.components.searchInput.placeholder)
      .fill(uniqueEmail);
    await expect(page.getByText(uniqueEmail)).not.toBeVisible();
  });

  test('Session revocation is enforced for another user', async ({
    page,
    baseURL,
  }) => {
    const randomId = randomString(8);
    const uniqueEmail = `session-target-${randomId}@user.com`;
    const uniqueName = `Session Target ${randomId}`;

    await page.getByText(t.user.manager.list.newButton).click();
    await page.waitForURL('/manager/users/new');
    await page.getByLabel(t.user.common.name.label).fill(uniqueName);
    await page.getByLabel(t.user.common.email.label).fill(uniqueEmail);
    await page.getByText(t.user.manager.new.createButton.label).click();

    await page.waitForURL('/manager/users');
    await page
      .getByPlaceholder(t.components.searchInput.placeholder)
      .fill(uniqueEmail);
    await page.getByRole('link', { name: uniqueName }).click();

    const userDetailUrl = page.url();

    const targetContext = await page
      .context()
      .browser()
      ?.newContext({
        baseURL: baseURL ?? undefined,
      });
    const targetPage = await targetContext?.newPage();

    try {
      if (!targetPage) {
        throw new Error('Expected browser context for target session');
      }

      await targetPage.goto('/login');
      await targetPage
        .getByPlaceholder(t.auth.common.email.label)
        .fill(uniqueEmail);
      await targetPage
        .getByRole('button', {
          name: t.auth.pageLogin.loginWithEmail,
        })
        .click();
      await targetPage.waitForURL('**/login/verify**');
      await targetPage
        .getByText(t.auth.common.otp.label)
        .fill(AUTH_EMAIL_OTP_MOCKED);
      await targetPage.waitForURL('/app');
      await expect(targetPage.getByTestId('layout-app')).toBeVisible();

      await page.goto(userDetailUrl);
      const revokeAllButton = page.getByRole('button', {
        name: t.user.manager.detail.revokeAllSessions,
      });
      await expect(revokeAllButton).toBeEnabled();
      await revokeAllButton.click();

      await expect(
        page.getByText(t.user.manager.detail.noSessions)
      ).toBeVisible();

      await targetPage.goto('/app');
      await targetPage.waitForURL(/\/login(\?.*)?$/);
      await expect(targetPage.getByTestId('layout-login')).toBeVisible();

      await deleteManagedUser(page);
    } finally {
      await targetContext?.close();
    }
  });
});
