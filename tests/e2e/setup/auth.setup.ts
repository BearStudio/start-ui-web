import { expect } from '@playwright/test';
import { test as setup } from '@tests/e2e/utils';
import {
  ADMIN_EMAIL,
  ADMIN_FILE,
  USER_EMAIL,
  USER_FILE,
} from '@tests/e2e/utils/constants';
import type { ExtendedPageInstance } from '@tests/e2e/utils/page';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * @see https://playwright.dev/docs/auth#multiple-signed-in-roles
 */

const authenticate = async (
  page: ExtendedPageInstance,
  input: {
    email: string;
    layoutTestId: string;
    storageFile: string;
    targetRoute: '/app' | '/manager';
  }
) => {
  const debugPayload = {
    layoutTestId: input.layoutTestId,
    storageFile: input.storageFile,
    targetRoute: input.targetRoute,
  };

  page.authDebug('setup.authenticate.start', debugPayload);
  await page.to('/login');
  page.authDebug('setup.login_page.opened', debugPayload);

  await page.login({ email: input.email });
  await page.waitForPostAuthRoute(input.targetRoute);
  await expect(page.getByTestId(input.layoutTestId)).toBeVisible();
  page.authDebug('setup.layout.visible', debugPayload);

  await mkdir(dirname(input.storageFile), { recursive: true });
  await page.context().storageState({ path: input.storageFile });
  page.authDebug('setup.storage_state.written', debugPayload);
};

setup('authenticate as admin', async ({ page }) => {
  await authenticate(page, {
    email: ADMIN_EMAIL,
    layoutTestId: 'layout-manager',
    storageFile: ADMIN_FILE,
    targetRoute: '/manager',
  });
});

setup('authenticate as user', async ({ page }) => {
  await authenticate(page, {
    email: USER_EMAIL,
    layoutTestId: 'layout-app',
    storageFile: USER_FILE,
    targetRoute: '/app',
  });
});
