import eslint from '@eslint/js';
import tslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import storybook from 'eslint-plugin-storybook';

export default tslint.config(
  eslint.configs.recommended,
  tslint.configs.recommended,
  sonarjs.configs.recommended,
  ...storybook.configs['flat/recommended'],
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
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
    },
  },
  {
    files: ['**/*.stories.tsx', './src/locales/**/*'],
    rules: {
      'import/no-anonymous-default-export': 'off',
    },
  }
);
