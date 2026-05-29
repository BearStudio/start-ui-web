const isFastMode = process.env.STRYKER_FAST === '1';

const normalReporters = ['progress', 'clear-text', 'html'];
const fastReporters = ['progress-append-only', 'clear-text'];

export function createScopedStrykerConfig({
  moduleName,
  mutationSourceFiles,
  mutationTestFiles,
  tsconfigFile,
}) {
  return {
    $schema: './node_modules/@stryker-mutator/core/schema/stryker-schema.json',
    plugins: [
      '@stryker-mutator/vitest-runner',
      '@stryker-mutator/typescript-checker',
    ],
    testRunner: 'vitest',
    coverageAnalysis: 'perTest',
    vitest: {
      configFile: 'vitest.config.ts',
    },
    mutate: mutationSourceFiles,
    testFiles: mutationTestFiles,
    ignorePatterns: [
      '/coverage',
      '/playwright-report',
      '/test-results',
      '/cosmos-export',
      '/.output',
      '/dist',
      '/build',
    ],
    thresholds: {
      high: 80,
      low: 70,
      break: 70,
    },
    tsconfigFile,
    checkers: isFastMode ? [] : ['typescript'],
    incremental: isFastMode,
    incrementalFile: `reports/stryker-incremental/${moduleName}.json`,
    ignoreStatic: isFastMode,
    reporters: isFastMode ? fastReporters : normalReporters,
    htmlReporter: {
      fileName: `reports/mutation/${moduleName}/mutation.html`,
    },
  };
}
