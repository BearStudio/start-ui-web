import path from 'node:path';
import { defineConfig } from 'vitest/config';

const resolve = (filePath: string) => path.resolve(__dirname, filePath);

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.postgres.test.ts'],
    fileParallelism: false,
    setupFiles: [resolve('tests/setup.base.ts')],
    testTimeout: 60_000,
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve('./src'),
      },
      {
        find: /^@tests\/(.*)$/,
        replacement: resolve('./tests/$1'),
      },
    ],
  },
});
