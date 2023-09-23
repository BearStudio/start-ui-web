import { expect, test } from '@playwright/test';

test('login as admin', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.getByLabel('Email').fill('admin@admin.com');
  await page.getByLabel(/^Password/).fill('admin');

  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(
    page.getByRole('heading', { name: 'Dashboard', level: 2 })
  ).toBeVisible();

  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
});

test('login as user', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.getByLabel('Email').fill('user@user.com');
  await page.getByLabel('Password*').fill('user');

  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(
    page.getByRole('heading', { name: 'Dashboard', level: 2 })
  ).toBeVisible();

  await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
});
