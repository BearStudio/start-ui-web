import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
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
          alias: {
            '@': resolve('./src'),
          },
        },
      },
      {
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
          alias: {
            '@': resolve('./src'),
          },
        },
      },
    ],
  },
});
