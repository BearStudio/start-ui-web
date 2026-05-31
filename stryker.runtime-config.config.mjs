import { createScopedStrykerConfig } from './stryker.shared.config.mjs';

export const mutationTestFiles = [
  'tests/unit/platform/runtime-config/application/**/*.unit.spec.ts',
];

export const mutationSourceFiles = [
  'src/platform/runtime-config/application/**/*.ts',
  '!**/*.spec.ts',
  '!**/*.test.ts',
  '!**/index.ts',
  '!src/platform/runtime-config/application/ports/**/*.ts',
  '!**/types.ts',
];

export default createScopedStrykerConfig({
  moduleName: 'runtime-config',
  mutationSourceFiles,
  mutationTestFiles,
  tsconfigFile: 'tsconfig.stryker.runtime-config.json',
});
