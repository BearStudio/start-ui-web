import type { Locator, Page } from '@playwright/test';
import { expect } from 'e2e/utils';
import path from 'node:path';

export const chromiumOnlyMessage =
  'Local visual baselines are intentionally kept to Chromium on the developer machine.';

export const desktopViewport = { width: 1280, height: 900 } as const;

const screenshotStylePath = path.join(import.meta.dirname, 'screenshot.css');

export const screenshot = async (
  page: Page,
  name: string,
  options: { mask?: Locator[] } = {}
) => {
  await expect(page).toHaveScreenshot(name, {
    animations: 'disabled',
    fullPage: true,
    stylePath: screenshotStylePath,
    ...options,
  });
};

export const dynamicUserMetadataMasks = (page: Page) => [
  page.getByText(/ago|Not onboarded/i),
];

export const openManagerUsersSearch = async (page: Page, email: string) => {
  await page.goto(`/manager/users?searchTerm=${encodeURIComponent(email)}`);
  await expect(page.getByText(email, { exact: true })).toBeVisible();
};

export const openManagerUserDetail = async (page: Page, email: string) => {
  await openManagerUsersSearch(page, email);
  await page
    .getByText(email, { exact: true })
    .locator('..')
    .getByRole('link')
    .click();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
};
