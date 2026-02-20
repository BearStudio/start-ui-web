import { expect, test } from 'e2e/utils';
import { ADMIN_FILE, USER_FILE } from 'e2e/utils/constants';
import { randomString } from 'remeda';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import locales from '@/locales';

const t = locales[DEFAULT_LANGUAGE_KEY];

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

  test('Create a user', async ({ page }) => {
    await page.getByText(t.user.manager.list.newButton).click();

    const randomId = randomString(8);
    const uniqueEmail = `new-user-${randomId}@user.com`;

    // Fill the form
    await page.waitForURL('/manager/users/new');
    await page.getByLabel(t.user.common.name.label).fill('New user');
    await page.getByLabel(t.user.common.email.label).fill(uniqueEmail);
    await page.getByText(t.user.manager.new.createButton.label).click();

    await page.waitForURL('/manager/users');
    await page
      .getByPlaceholder(t.components.searchInput.placeholder)
      .fill(`new-user-${randomId}`);
    await expect(page.getByText(uniqueEmail)).toBeVisible();
  });

  test('Edit a user', async ({ page }) => {
    await page.getByText('admin@admin.com').click({
      force: true,
    });

    await page
      .getByRole('link', { name: t.user.manager.detail.editUser })
      .click();

    const randomId = randomString(8);
    const newAdminName = `Admin ${randomId}`;
    await page.getByLabel(t.user.common.name.label).fill(newAdminName);
    await page.getByText(t.user.manager.update.updateButton.label).click();

    await expect(
      page.locator('main').getByText(newAdminName).first()
    ).toBeVisible();
  });

  test('Delete a user', async ({ page }) => {
    await page
      .getByText('user', {
        exact: true,
      })
      .first()
      .click({ force: true });

    await page
      .getByRole('button', { name: t.user.manager.detail.deleteButton.label })
      .click();

    await expect(
      page.getByText(t.user.manager.detail.confirmDeleteDescription)
    ).toBeVisible();

    await page
      .getByRole('button', { name: t.user.manager.detail.deleteButton.label })
      .click();

    await expect(
      page.getByText(t.user.manager.detail.userDeleted)
    ).toBeVisible();
  });
});
