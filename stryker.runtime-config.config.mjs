import { createScopedStrykerConfig } from './stryker.shared.config.mjs';

export const mutationTestFiles = [
  'src/modules/runtime-config/application/**/*.unit.spec.ts',
];

export const mutationSourceFiles = [
  'src/modules/runtime-config/application/**/*.ts',
  '!**/*.spec.ts',
  '!**/*.test.ts',
  '!**/index.ts',
  '!src/modules/runtime-config/application/ports/**/*.ts',
  '!**/types.ts',
];

export default createScopedStrykerConfig({
  moduleName: 'runtime-config',
  mutationSourceFiles,
  mutationTestFiles,
  tsconfigFile: 'tsconfig.stryker.runtime-config.json',
});
