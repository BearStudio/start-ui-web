import { defineConfig, devices } from '@playwright/test';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

const configuredBaseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.VITE_BASE_URL ??
  'http://localhost:3000';
const configuredURL = new URL(configuredBaseURL);
const localPlaywrightHost =
  process.env.PLAYWRIGHT_HOST ?? configuredURL.hostname;
const localPlaywrightPort =
  process.env.PLAYWRIGHT_PORT ??
  (configuredURL.port || (configuredURL.protocol === 'https:' ? '443' : '80'));
const localPlaywrightBaseURL = `${configuredURL.protocol}//${localPlaywrightHost}:${localPlaywrightPort}`;
const usesExternalBaseURL = process.env.PLAYWRIGHT_BASE_URL !== undefined;
const playwrightBaseURL = usesExternalBaseURL
  ? configuredBaseURL
  : localPlaywrightBaseURL;

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
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: playwrightBaseURL,

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
  webServer: usesExternalBaseURL
    ? undefined
    : {
        command: `VITE_BASE_URL="${playwrightBaseURL}" VITE_PORT=${localPlaywrightPort} corepack pnpm run env && VITE_BASE_URL="${playwrightBaseURL}" VITE_PORT=${localPlaywrightPort} corepack pnpm run dev:app -- --host ${localPlaywrightHost} --port ${localPlaywrightPort}`,
        url: playwrightBaseURL,
        reuseExistingServer: !process.env.CI,
      },
});
