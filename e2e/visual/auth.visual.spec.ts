import { expect, test } from 'e2e/utils';
import { USER_EMAIL } from 'e2e/utils/constants';

import { chromiumOnlyMessage, desktopViewport, screenshot } from './helpers';

test.describe('Auth visual regression', () => {
  test.describe.configure({ timeout: 60_000 });

  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    chromiumOnlyMessage
  );

  test.use({ viewport: desktopViewport });

  test('login page remains visually stable', async ({ page }) => {
    await page.to('/login');
    await expect(page.getByTestId('auth-login-form')).toHaveAttribute(
      'data-hydrated',
      'true'
    );
    await screenshot(page, 'login-page.png');
  });

  test('login verification page remains visually stable', async ({ page }) => {
    await page.to('/login');
    await expect(page.getByTestId('auth-login-form')).toHaveAttribute(
      'data-hydrated',
      'true'
    );
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
});
