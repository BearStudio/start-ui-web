import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const resolve = (filePath: string) => path.resolve(__dirname, filePath);

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        test: {
          name: 'browser',
          browser: {
            enabled: true,
            provider: 'playwright',
            // https://vitest.dev/guide/browser/playwright
            instances: [
              {
                browser: 'chromium',
                context: {
                  permissions: ['clipboard-write', 'clipboard-read'],
                },
              },
            ],
          },
          include: ['app/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
          setupFiles: [
            resolve('app/tests/setup.base.ts'),
            resolve('app/tests/setup.browser.ts'),
          ],
        },
        resolve: {
          alias: {
            '@': resolve('./app'),
          },
        },
      },
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['app/**/*.unit.{test,spec}.?(c|m)[jt]s?(x)'],
          setupFiles: [resolve('app/tests/setup.base.ts')],
        },
        resolve: {
          alias: {
            '@': resolve('./app'),
          },
        },
      },
    ],
  },
});
