import { createScopedStrykerConfig } from './stryker.shared.config.mjs';

export const mutationTestFiles = [
  'tests/unit/modules/kernel/__tests__/**/*.unit.spec.ts',
  'tests/unit/modules/kernel/application/**/*.unit.spec.ts',
  'tests/unit/modules/kernel/domain/**/*.unit.spec.ts',
];

export const mutationSourceFiles = [
  'src/modules/kernel/domain/**/*.ts',
  'src/modules/kernel/application/**/*.ts',
  '!**/*.spec.ts',
  '!**/*.test.ts',
  '!**/index.ts',
  '!src/modules/kernel/application/ports/**/*.ts',
  '!**/types.ts',
];

export default createScopedStrykerConfig({
  moduleName: 'kernel',
  mutationSourceFiles,
  mutationTestFiles,
  tsconfigFile: 'tsconfig.stryker.kernel.json',
});
