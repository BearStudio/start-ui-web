import { expect, test } from 'e2e/utils';
import { ADMIN_FILE, USER_FILE } from 'e2e/utils/constants';
import { randomString } from 'remeda';

test.describe('User management as user', () => {
  test.use({ storageState: USER_FILE });

  test('Should not have access', async ({ page }) => {
    await page.to('/manager/users');

    await expect(
      page.getByText("You don't have access to this page")
    ).toBeVisible();
  });
});

test.describe('User management as manager', () => {
  test.use({ storageState: ADMIN_FILE });

  test.beforeEach(async ({ page }) => {
    await page.to('/manager/users');
  });

  test('Create a user', async ({ page }) => {
    await page.getByText('New User').click();

    const randomId = randomString(8);
    const uniqueEmail = `new-user-${randomId}@user.com`;

    // Fill the form
    await page.waitForURL('/manager/users/new');
    await page.getByLabel('Name').fill('New user');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByText('Create').click();

    await page.waitForURL('/manager/users');
    await page.getByPlaceholder('Search...').fill('new-user');
    await expect(page.getByText(uniqueEmail)).toBeVisible();
  });

  test('Edit a user', async ({ page }) => {
    await page.getByText('admin@admin.com').click({
      force: true,
    });

    await page.getByRole('link', { name: 'Edit user' }).click();

    const randomId = randomString(8);
    const newAdminName = `Admin ${randomId}`;
    await page.getByLabel('Name').fill(newAdminName);
    await page.getByText('Save').click();

    await expect(page.getByText(newAdminName).first()).toBeVisible();
  });

  test('Delete a user', async ({ page }) => {
    await page
      .getByText('user', {
        exact: true,
      })
      .first()
      .click({ force: true });

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(
      page.getByText('You are about to permanently delete this user.')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('User deleted')).toBeVisible();
  });
});
