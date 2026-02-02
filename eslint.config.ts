import eslint from '@eslint/js';
import react from '@eslint-react/eslint-plugin';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import tanstackRouter from '@tanstack/eslint-plugin-router';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import * as storybook from 'eslint-plugin-storybook';
import unicorn from 'eslint-plugin-unicorn';
import tslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tslint.configs.recommended,
  // @ts-expect-error Type error with latest version of eslint-plugin-sonarjs
  sonarjs.configs.recommended,
  ...storybook.configs['flat/recommended'],
  ...tanstackRouter.configs['flat/recommended'],
  ...tanstackQuery.configs['flat/recommended'],
  react.configs['recommended-typescript'],
  reactHooks.configs.flat.recommended,
  {
    rules: {
      'sonarjs/todo-tag': 'warn',
      'sonarjs/no-redundant-jump': 'off',
      'react/no-unescaped-entities': 'off',
      'no-unreachable': 'error',
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/no-unused-vars': 'off',
      'sonarjs/prefer-read-only-props': 'off',
      'sonarjs/function-return-type': 'off',
      'sonarjs/no-redundant-optional': 'off',
      'sonarjs/no-useless-intersection': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/cognitive-complexity': ['warn', 50],
      'sonarjs/prefer-immediate-return': 'warn',
    },
  },
  {
    plugins: {
      unicorn,
    },
    ignores: ['src/routes/**/*.*', '**/generated/**/*.*'],
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: ['^routeTree\\.gen\\.ts$', '^Icon(.*)\\.tsx'],
        },
      ],
    },
  },
  {
    files: ['src/**/*'],
    rules: {
      'no-process-env': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.type='MemberExpression'][object.object.type='MetaProperty'][object.object.property.name='meta'][object.property.name='env'][property.name!=/^(DEV|PROD|MODE|SSR|BASE_URL|MANIFEST)$/]",
          message:
            'Custom import.meta.env variables are not allowed. Use envClient and envServer from @/env/client and @/env/servr folder instead.',
        },
      ],
    },
  },
  {
    files: ['**/*.stories.tsx', './src/locales/**/*'],
    rules: {
      'import/no-anonymous-default-export': 'off',
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/exports': 'warn',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            // ext library & side effect imports
            ['^@?\\w', '^\\u0000'],
            // {s}css files
            ['^.+\\.s?css$'],
            // Lib and hooks
            ['^@/lib', '^@/hooks'],
            // static data
            ['^@/data'],
            // components
            ['^@/components', '^@/container'],
            // zustand store
            ['^@/store'],
            // Other imports
            ['^@/'],
            // relative paths up until 3 level
            [
              '^\\./?$',
              '^\\.(?!/?$)',
              '^\\.\\./?$',
              '^\\.\\.(?!/?$)',
              '^\\.\\./\\.\\./?$',
              '^\\.\\./\\.\\.(?!/?$)',
              '^\\.\\./\\.\\./\\.\\./?$',
              '^\\.\\./\\.\\./\\.\\.(?!/?$)',
            ],
            ['^@/types'],
            // other that didnt fit in
            ['^'],
          ],
        },
      ],
    },
  }
);
