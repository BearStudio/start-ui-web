import { expect, test } from '@tests/e2e/utils';
import { USER_FILE } from '@tests/e2e/utils/constants';

import { chromiumOnlyMessage, desktopViewport, screenshot } from './helpers';

test.describe('App shell visual regression', () => {
  test.describe.configure({ timeout: 60_000 });

  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    chromiumOnlyMessage
  );

  test.use({ storageState: USER_FILE, viewport: desktopViewport });

  test('authenticated app shell remains visually stable', async ({ page }) => {
    await page.to('/app');
    await expect(page.getByTestId('layout-app')).toBeVisible();
    await expect(
      page.locator('a[href="/app"]').getByText(/access denied/i)
    ).toBeHidden();
    await screenshot(page, 'authenticated-app-shell.png');
  });
});
