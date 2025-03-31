import eslint from '@eslint/js';
import react from '@eslint-react/eslint-plugin';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import tanstackRouter from '@tanstack/eslint-plugin-router';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import storybook from 'eslint-plugin-storybook';
import tslint from 'typescript-eslint';

export default tslint.config(
  eslint.configs.recommended,
  tslint.configs.recommended,
  sonarjs.configs.recommended,
  ...storybook.configs['flat/recommended'],
  ...tanstackRouter.configs['flat/recommended'],
  ...tanstackQuery.configs['flat/recommended'],
  react.configs['recommended-typescript'],
  reactHooks.configs['recommended-latest'],
  {
    rules: {
      'sonarjs/todo-tag': 'warn',
      'react/no-unescaped-entities': 'off',
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
