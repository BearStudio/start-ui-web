import { defineConfig, devices } from '@playwright/test';

import { DEFAULT_LANGUAGE_KEY } from '@/platform/lib/i18n/constants';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  testIgnore: process.env.CI ? /visual\.spec\.ts/ : undefined,
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
  /* The E2E server uses one shared PGLite database instance. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.VITE_BASE_URL,

    /* Collect diagnostics when a test fails in CI. */
    screenshot: 'only-on-failure',
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },

  /* Increase the timeout to absorb initial dev-server compilation. */
  expect: { timeout: 10000 },

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
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], locale: DEFAULT_LANGUAGE_KEY },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], locale: DEFAULT_LANGUAGE_KEY },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm e2e:webserver',
    url: process.env.VITE_BASE_URL,
    reuseExistingServer: false,
  },
});
