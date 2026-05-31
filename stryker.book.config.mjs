import { createScopedStrykerConfig } from './stryker.shared.config.mjs';

export const mutationTestFiles = [
  'tests/unit/modules/book/domain/**/*.unit.spec.ts',
  'tests/unit/modules/book/application/**/*.unit.spec.ts',
];

export const mutationSourceFiles = [
  'src/modules/book/domain/**/*.ts',
  'src/modules/book/application/**/*.ts',
  '!**/*.spec.ts',
  '!**/*.test.ts',
  '!**/index.ts',
  '!src/modules/book/application/ports/**/*.ts',
  '!**/types.ts',
];

export default createScopedStrykerConfig({
  moduleName: 'book',
  mutationSourceFiles,
  mutationTestFiles,
  tsconfigFile: 'tsconfig.stryker.book.json',
});
