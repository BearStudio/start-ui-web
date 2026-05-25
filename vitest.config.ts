import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const resolve = (filePath: string) => path.resolve(__dirname, filePath);

const testAliases = [
  {
    find: /^@tanstack\/react-start$/,
    replacement: resolve('./src/tests/mocks/tanstack-react-start.ts'),
  },
  {
    find: /^@tanstack\/react-start\/server$/,
    replacement: resolve('./src/tests/mocks/tanstack-react-start-server.ts'),
  },
  {
    find: '@',
    replacement: resolve('./src'),
  },
];

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        optimizeDeps: {
          include: [
            '@base-ui/react/merge-props',
            '@base-ui/react/use-render',
            '@tanstack/react-router',
            'better-auth/client/plugins',
            'better-auth/plugins/access',
            'better-auth/plugins/admin/access',
            'better-auth/react',
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
          alias: testAliases,
        },
      },
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.unit.{test,spec}.?(c|m)[jt]s?(x)'],
          setupFiles: [
            resolve('src/tests/setup.base.ts'),
            resolve('src/tests/server/test-setup.ts'),
          ],
        },
        resolve: {
          alias: testAliases,
        },
      },
    ],
  },
});
