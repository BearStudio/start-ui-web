import { createScopedStrykerConfig } from './stryker.shared.config.mjs';

export const mutationTestFiles = [
  'tests/unit/modules/genre/domain/**/*.unit.spec.ts',
  'tests/unit/modules/genre/application/**/*.unit.spec.ts',
];

export const mutationSourceFiles = [
  'src/modules/genre/domain/**/*.ts',
  'src/modules/genre/application/**/*.ts',
  '!**/*.spec.ts',
  '!**/*.test.ts',
  '!**/index.ts',
  '!src/modules/genre/application/ports/**/*.ts',
  '!**/types.ts',
];

export default createScopedStrykerConfig({
  moduleName: 'genre',
  mutationSourceFiles,
  mutationTestFiles,
  tsconfigFile: 'tsconfig.stryker.genre.json',
});
