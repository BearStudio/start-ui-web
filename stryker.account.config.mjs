import { createScopedStrykerConfig } from './stryker.shared.config.mjs';

export const mutationTestFiles = [
  'tests/unit/modules/account/domain/**/*.unit.spec.ts',
  'tests/unit/modules/account/application/**/*.unit.spec.ts',
];

export const mutationSourceFiles = [
  'src/modules/account/domain/**/*.ts',
  'src/modules/account/application/**/*.ts',
  '!**/*.spec.ts',
  '!**/*.test.ts',
  '!**/index.ts',
  '!src/modules/account/application/ports/**/*.ts',
  '!**/types.ts',
];

export default createScopedStrykerConfig({
  moduleName: 'account',
  mutationSourceFiles,
  mutationTestFiles,
  tsconfigFile: 'tsconfig.stryker.account.json',
});
