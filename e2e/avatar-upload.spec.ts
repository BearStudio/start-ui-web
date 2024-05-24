import { expect, test } from '@playwright/test';
import { pageUtils } from 'e2e/utils/pageUtils';
import { USER_EMAIL } from 'e2e/utils/users';

import { env } from '@/env.mjs';
import { APP_PATH } from '@/features/app/constants';
import locales from '@/locales';

test.beforeEach('Login to the app', async ({ page }) => {
  const utils = pageUtils(page);

  await utils.loginApp({ email: USER_EMAIL });
  await page.waitForURL(`${env.NEXT_PUBLIC_BASE_URL}${APP_PATH || '/'}**`);
  await expect(page.getByTestId('app-layout')).toBeVisible();
});
test.describe('Avatar upload flow', () => {
  test('Upload an avatar', async ({ page }) => {
    await expect(page.getByTestId('avatar-account')).toBeVisible();

    await page.getByTestId('avatar-account').click();

    await page.waitForURL(`**${APP_PATH}/account`);
    await expect(
      page.getByText(locales.en.account.data.avatar.inputText)
    ).toBeVisible();

    const fileChooserPromise = page.waitForEvent('filechooser');

    await page.getByText(locales.en.account.data.avatar.inputText).click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('./public/android-chrome-192x192.png');

    await page
      .getByRole('button', { name: locales.en.account.profile.actions.update })
      .first()
      .click();

    await expect(
      page.locator('a[data-testid="avatar-account"] > img')
    ).toHaveAttribute('src');
  });
});
