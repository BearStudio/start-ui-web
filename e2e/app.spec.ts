import { expect, test } from '@playwright/test';
import { pageUtils } from 'e2e/utils/pageUtils';
import { USER_EMAIL } from 'e2e/utils/users';

import { env } from '@/env.mjs';
import { ROUTES_APP } from '@/features/app/routes';

test.describe('App access', () => {
  test(`Redirect to App (${ROUTES_APP.root()})`, async ({ page }) => {
    const utils = pageUtils(page);

    await utils.loginApp({ email: USER_EMAIL });
    await page.waitForURL(`${env.NEXT_PUBLIC_BASE_URL}${ROUTES_APP.root()}**`);

    await expect(page.getByTestId('app-layout')).toBeVisible();
  });
});
