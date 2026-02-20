import { defineConfig, devices } from '@playwright/test';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Max time for the full CI tests */
  globalTimeout: 15 * 60 * 1000,
  /* Max test failure */
  maxFailures: process.env.CI ? 1 : 0,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'github' : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.VITE_BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Increase the timeout to operate on Github Actions */
  expect: { timeout: process.env.CI ? 10000 : undefined },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      // eslint-disable-next-line sonarjs/slow-regex
      testMatch: /.*\.setup\.ts/,
      use: { locale: DEFAULT_LANGUAGE_KEY },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], locale: DEFAULT_LANGUAGE_KEY },
      dependencies: process.env.CI ? ['setup'] : [],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], locale: DEFAULT_LANGUAGE_KEY },
      dependencies: process.env.CI ? ['setup'] : [],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], locale: DEFAULT_LANGUAGE_KEY },
      dependencies: process.env.CI ? ['setup'] : [],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: process.env.VITE_BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
