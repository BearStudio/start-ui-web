import eslint from '@eslint/js';
import react from '@eslint-react/eslint-plugin';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import tanstackRouter from '@tanstack/eslint-plugin-router';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import * as storybook from 'eslint-plugin-storybook';
import unicorn from 'eslint-plugin-unicorn';
import tslint from 'typescript-eslint';

export default tslint.config(
  eslint.configs.recommended,
  tslint.configs.recommended,
  sonarjs.configs.recommended,
  // @ts-expect-error not sure it is related to https://github.com/storybookjs/eslint-plugin-storybook/issues/209 but quite similar
  ...storybook.configs['flat/recommended'],
  ...tanstackRouter.configs['flat/recommended'],
  ...tanstackQuery.configs['flat/recommended'],
  react.configs['recommended-typescript'],
  reactHooks.configs['recommended-latest'],
  {
    rules: {
      'sonarjs/todo-tag': 'warn',
      'sonarjs/no-redundant-jump': 'off',
      'react/no-unescaped-entities': 'off',
      'no-unreachable': 'error',
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/no-unused-vars': 'off',
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
    ignores: ['app/routes/**/*.*'],
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
    files: ['app/**/*'],
    rules: {
      'no-process-env': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.type='MemberExpression'][object.object.type='MetaProperty'][object.object.property.name='meta'][object.property.name='env'][property.name!=/^(DEV|PROD|MODE|SSR|BASE_URL|MANIFEST)$/]",
          message:
            'Custom import.meta.env variables are not allowed. Use envClient and envServer from @/app/env folder instead.',
        },
      ],
    },
  },
  {
    files: ['**/*.stories.tsx', './app/locales/**/*'],
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
