import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { createRequire } from 'node:module';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const resolve = (filePath: string) =>
  path.resolve(import.meta.dirname, filePath);

// Pre-bundle every ui-sdk entry point. Otherwise Vite finds a newly imported
// subpath during the run, re-optimizes and reloads, and that test file fails.
const uiSdkReactEntries = Object.keys(
  (
    createRequire(import.meta.url)('@ui-sdk/react/package.json') as {
      exports: Record<string, unknown>;
    }
  ).exports
)
  .filter((key) => key !== './package.json')
  .map((key) => path.posix.join('@ui-sdk/react', key));

export default defineConfig({
  plugins: [react()],
  test: {
    // Files share one module graph (`isolate: false`), so every file must
    // leave nothing behind. These options reset mocks, env and globals after
    // each test. See "Tests" in AGENTS.md.
    isolate: false,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    // Random order flushes out tests that depend on another one running first.
    sequence: { shuffle: true },
    // `--changed` (PR selection) runs everything when one of these changes,
    // since the module graph cannot see their effect.
    forceRerunTriggers: [
      '**/package.json',
      '**/pnpm-lock.yaml',
      '**/{vitest,vite}.config.*',
      '**/tsconfig.json',
      '**/prisma/schema.prisma',
      '**/src/tests/**',
      '**/src/server/routers/test-{setup,utils}.ts',
      '**/.github/workflows/**',
    ],
    projects: [
      {
        extends: true,
        test: {
          name: 'browser',
          browser: {
            enabled: true,
            headless: process.env.VITEST_BROWSER_HEADED !== 'true',
            provider: playwright({
              contextOptions: {
                permissions: ['clipboard-write', 'clipboard-read'],
              },
            }),
            instances: [{ browser: 'chromium' }],
          },
          include: ['src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
          setupFiles: [
            resolve('src/tests/setup.base.ts'),
            resolve('src/tests/setup.browser.ts'),
          ],
        },
        resolve: {
          tsconfigPaths: true,
        },
        optimizeDeps: {
          entries: ['src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
          include: ['@ui-sdk/core', ...uiSdkReactEntries],
        },
      },
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.unit.{test,spec}.?(c|m)[jt]s?(x)'],
          setupFiles: [
            resolve('src/tests/setup.base.ts'),
            resolve('src/server/routers/test-setup.ts'),
          ],
        },
        resolve: {
          tsconfigPaths: true,
        },
      },
    ],
  },
});
