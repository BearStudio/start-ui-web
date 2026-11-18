import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const resolve = (filePath: string) =>
  path.resolve(import.meta.dirname, filePath);

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        plugins: [tailwindcss()],
        // Prebundled before the first spec runs: a dependency found mid-run reloads the page, and two copies of React
        // then break hooks.
        optimizeDeps: {
          include: [
            '@tanstack/react-router',
            '@tanstack/react-table',
            '@tanstack/react-virtual',
          ],
        },
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
          tsconfigPaths: true,
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
          tsconfigPaths: true,
        },
      },
    ],
  },
});
