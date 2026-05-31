import { createScopedStrykerConfig } from './stryker.shared.config.mjs';

export const mutationTestFiles = [
  'tests/unit/modules/auth/domain/**/*.unit.spec.ts',
  'tests/unit/modules/auth/application/**/*.unit.spec.ts',
];

export const mutationSourceFiles = [
  'src/modules/auth/domain/**/*.ts',
  'src/modules/auth/application/**/*.ts',
  '!**/*.spec.ts',
  '!**/*.test.ts',
  '!**/index.ts',
  '!src/modules/auth/application/ports/**/*.ts',
  '!**/types.ts',
];

export default createScopedStrykerConfig({
  moduleName: 'auth',
  mutationSourceFiles,
  mutationTestFiles,
  tsconfigFile: 'tsconfig.stryker.auth.json',
});
