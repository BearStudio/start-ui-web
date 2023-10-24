import { expect, test } from '@playwright/test';
import { pageUtils } from 'e2e/utils/pageUtils';
import { ADMIN_EMAIL } from 'e2e/utils/users';

import { ADMIN_PATH } from '@/features/admin/constants';

test.describe('Admin access', () => {
  test(`Redirect to Admin (${ADMIN_PATH})`, async ({ page }) => {
    const utils = pageUtils(page);

    await utils.loginAdmin({ email: ADMIN_EMAIL });
    await page.waitForURL(`**${ADMIN_PATH}/**`);

    await expect(page.getByTestId('admin-layout')).toBeVisible();
  });
});
