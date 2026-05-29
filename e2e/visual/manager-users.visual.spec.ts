import { expect, test } from 'e2e/utils';
import { ADMIN_EMAIL, ADMIN_FILE, USER_EMAIL } from 'e2e/utils/constants';

import {
  chromiumOnlyMessage,
  desktopViewport,
  dynamicUserMetadataMasks,
  openManagerUserDetail,
  openManagerUsersSearch,
  screenshot,
} from './helpers';

test.describe('Manager users visual regression', () => {
  test.describe.configure({ timeout: 60_000 });

  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    chromiumOnlyMessage
  );

  test.use({ storageState: ADMIN_FILE, viewport: desktopViewport });

  test('manager users list remains visually stable', async ({ page }) => {
    await openManagerUsersSearch(page, ADMIN_EMAIL);
    await screenshot(page, 'manager-users-list.png', {
      mask: dynamicUserMetadataMasks(page),
    });
  });

  test('manager user create screen remains visually stable', async ({
    page,
  }) => {
    await page.to('/manager/users');
    await page.getByRole('link', { name: /new/i }).click();
    await page.waitForURL('**/manager/users/new');
    await expect(page.getByTestId('manager-user-new-form')).toHaveAttribute(
      'data-hydrated',
      'true'
    );
    await screenshot(page, 'manager-user-create.png');
  });

  test('manager user edit screen remains visually stable', async ({ page }) => {
    await openManagerUserDetail(page, ADMIN_EMAIL);
    await page.getByRole('link', { name: /edit user/i }).click();
    await page.waitForURL('**/manager/users/**/update');
    await expect(page.getByLabel('Email')).toHaveValue(ADMIN_EMAIL);
    await screenshot(page, 'manager-user-edit.png');
  });

  test('manager user delete confirmation remains visually stable', async ({
    page,
  }) => {
    await openManagerUserDetail(page, USER_EMAIL);
    await page.getByRole('button', { name: /delete/i }).click();
    await expect(
      page.getByRole('dialog', { name: /delete user/i })
    ).toBeVisible();
    await screenshot(page, 'manager-user-delete-confirmation.png', {
      mask: dynamicUserMetadataMasks(page),
    });
  });
});
