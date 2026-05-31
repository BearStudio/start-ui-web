import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import reactHooks from 'eslint-plugin-react-hooks';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

const tsFiles = ['**/*.{ts,tsx,mts,cts}'];
const sourceTsFiles = ['src/**/*.{ts,tsx}'];
const e2eFiles = ['e2e/**/*.ts'];
const nonProductionFiles = [
  '**/*.{spec,test}.{ts,tsx}',
  '**/__tests__/**/*.{ts,tsx}',
  '**/*.fixture.tsx',
  'src/tests/**/*.{ts,tsx}',
];

const warnRules = (rules) =>
  Object.fromEntries(
    Object.entries(rules).map(([ruleName, ruleConfig]) => {
      if (ruleConfig === 'off' || ruleConfig === 0) {
        return [ruleName, ruleConfig];
      }

      if (Array.isArray(ruleConfig)) {
        if (ruleConfig[0] === 'off' || ruleConfig[0] === 0) {
          return [ruleName, ruleConfig];
        }

        return [ruleName, ['warn', ...ruleConfig.slice(1)]];
      }

      return [ruleName, 'warn'];
    })
  );

export default defineConfig([
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  {
    ignores: [
      '.output/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'playwright-report/**',
      'src/platform/components/icons/generated/**',
      'src/routeTree.gen.ts',
      'test-results/**',
      '**/__screenshots__/**',
    ],
  },
  {
    files: tsFiles,
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@eslint-react': eslintReact,
      '@eslint-react/naming-convention': {
        rules: {
          'use-state': eslintReact.rules['use-state'],
        },
      },
      '@typescript-eslint': tseslint.plugin,
    },
  },
  {
    files: sourceTsFiles,
    ignores: nonProductionFiles,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-for-in-array': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'warn',
        {
          checksVoidReturn: {
            arguments: false,
            attributes: false,
          },
        },
      ],
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/return-await': ['warn', 'in-try-catch'],
    },
  },
  {
    files: sourceTsFiles,
    ignores: nonProductionFiles,
    plugins: reactHooks.configs.flat['recommended-latest'].plugins,
    rules: warnRules(reactHooks.configs.flat['recommended-latest'].rules),
  },
  {
    files: tsFiles,
    ignores: nonProductionFiles,
    plugins: {
      security,
      sonarjs,
    },
    rules: {
      ...warnRules(security.configs.recommended.rules),
      ...warnRules(sonarjs.configs.recommended.rules),
    },
  },
  {
    files: e2eFiles,
    ...playwright.configs['flat/recommended'],
  },
]);
