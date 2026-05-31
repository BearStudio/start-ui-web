import { createScopedStrykerConfig } from './stryker.shared.config.mjs';

export const mutationTestFiles = [
  'tests/unit/modules/user/domain/**/*.unit.spec.ts',
  'tests/unit/modules/user/application/**/*.unit.spec.ts',
];

export const mutationSourceFiles = [
  'src/modules/user/domain/**/*.ts',
  'src/modules/user/application/**/*.ts',
  '!**/*.spec.ts',
  '!**/*.test.ts',
  '!**/index.ts',
  '!src/modules/user/application/ports/**/*.ts',
  '!**/types.ts',
];

export default createScopedStrykerConfig({
  moduleName: 'user',
  mutationSourceFiles,
  mutationTestFiles,
  tsconfigFile: 'tsconfig.stryker.user.json',
});
