import { createScopedStrykerConfig } from './stryker.shared.config.mjs';

export const mutationTestFiles = ['tests/unit/platform/**/*.unit.spec.ts'];

export const mutationSourceFiles = [
  'src/platform/http/**/*.ts',
  'src/platform/lib/dayjs/**/*.ts',
  'src/platform/lib/get-page-title.ts',
  'src/platform/lib/redaction/**/*.ts',
  'src/platform/lib/tailwind/**/*.ts',
  'src/platform/lib/tanstack-query/scoped-query-options.ts',
  'src/platform/lib/tanstack-start/**/*.ts',
  'src/platform/lib/zod/**/*.ts',
  '!**/*.spec.ts',
  '!**/*.test.ts',
  '!**/index.ts',
  '!**/types.ts',
];

export default createScopedStrykerConfig({
  moduleName: 'shared',
  mutationSourceFiles,
  mutationTestFiles,
  tsconfigFile: 'tsconfig.stryker.shared-only.json',
});
