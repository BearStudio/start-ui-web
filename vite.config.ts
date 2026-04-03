import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import cpy from 'cpy';
import { nitro } from 'nitro/vite';
import { resolve } from 'node:path';
import { defineConfig, loadEnv, type UserConfig } from 'vite-plus';

const { nitroRetrieveServerDirHook, prismaCopyBinariesPlugin } =
  createPrismaCopyBinariesPlugin();
const envMode = process.env.MODE ?? process.env.NODE_ENV ?? 'development';
const env = loadEnv(envMode, process.cwd(), 'VITE_');
const fmt: NonNullable<UserConfig['fmt']> = {
  printWidth: 80,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  arrowParens: 'always',
  sortTailwindcss: {
    stylesheet: './src/styles/app.css',
    functions: ['cn', 'cva'],
  },
  ignorePatterns: [
    '.cache',
    '.db',
    '.history',
    'output',
    '.vinxi',
    'node_modules',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'public',
    '**/*.md',
    '**/*.mdx',
    '.env*',
    '**/*.gen.ts',
    'src/server/db/generated',
  ],
};
const lint: NonNullable<UserConfig['lint']> = {
  plugins: ['react', 'unicorn', 'typescript', 'node'],
  jsPlugins: [
    '@tanstack/eslint-plugin-query',
    '@tanstack/eslint-plugin-router',
    'eslint-plugin-simple-import-sort',
    'eslint-plugin-sonarjs',
    'eslint-plugin-storybook',
  ],
  categories: {
    correctness: 'error',
  },
  rules: {
    'no-unreachable': 'error',
    'typescript/no-unused-vars': [
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
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
      },
    ],
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          ['^@?\\w', '^\\u0000'],
          ['^.+\\.s?css$'],
          ['^@/lib', '^@/hooks'],
          ['^@/data'],
          ['^@/components', '^@/container'],
          ['^@/store'],
          ['^@/'],
          [
            '^\\./?$',
            '^\\.(?!/?$)',
            '^\\.\\./?$',
            '^\\.\\.(?!/?$)',
            '^\\.\\./\\.\\./?$',
            '^\\.\\./\\.\\.(?!/?$)',
            '^\\.\\./\\.\\./\\.\\./?$',
            '^\\.\\./\\.\\./\\.\\.\\.(?!/?$)',
          ],
          ['^@/types'],
          ['^'],
        ],
      },
    ],
    'simple-import-sort/exports': 'warn',
    '@tanstack/query/exhaustive-deps': 'error',
    '@tanstack/query/no-rest-destructuring': 'warn',
    '@tanstack/query/stable-query-client': 'error',
    '@tanstack/query/no-unstable-deps': 'error',
    '@tanstack/query/infinite-query-property-order': 'error',
    '@tanstack/query/no-void-query-fn': 'error',
    '@tanstack/query/mutation-property-order': 'error',
    '@tanstack/router/create-route-property-order': 'warn',
    '@tanstack/router/route-param-names': 'error',
    'sonarjs/cognitive-complexity': ['warn', 50],
    'sonarjs/prefer-immediate-return': 'warn',
    'sonarjs/todo-tag': 'warn',
  },
  overrides: [
    {
      files: ['src/**/*'],
      rules: {
        'node/no-process-env': 'error',
      },
    },
    {
      files: [
        'src/routes/**/*.*',
        '**/generated/**/*.*',
        'src/routeTree.gen.ts',
      ],
      rules: {
        'unicorn/filename-case': 'off',
      },
    },
    {
      files: ['**/*.stories.*'],
      rules: {
        'storybook/await-interactions': 'error',
        'storybook/context-in-play-function': 'error',
        'storybook/default-exports': 'error',
        'storybook/hierarchy-separator': 'warn',
        'storybook/no-redundant-story-name': 'warn',
        'storybook/no-renderer-packages': 'error',
        'storybook/prefer-pascal-case': 'warn',
        'storybook/story-exports': 'error',
        'storybook/use-storybook-expect': 'error',
        'storybook/use-storybook-testing-library': 'error',
        'storybook/no-uninstalled-addons': 'error',
      },
    },
  ],
  options: {},
};

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: env.VITE_PORT ? Number(env.VITE_PORT) : 3000,
    strictPort: true,
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    nitro({
      modules: [
        (nitro) => {
          nitro.hooks.hook('build:before', () => {
            nitroRetrieveServerDirHook(nitro);
          });
        },
      ],
      routeRules: { '/storybook': { redirect: '/storybook/' } },
    }),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
    // Copy prisma binaries at the end
    prismaCopyBinariesPlugin(),
  ],
  fmt,
  lint,
  staged: {
    '*': 'vp check --fix',
  },
});

function createPrismaCopyBinariesPlugin() {
  let serverDir = '';
  return {
    nitroRetrieveServerDirHook: (_nitro: {
      options: { output: { serverDir: string } };
    }) => {
      serverDir = _nitro.options.output.serverDir.replace(resolve('.'), '.');
    },
    prismaCopyBinariesPlugin: () => ({
      name: 'prisma-copy-binaries',
      writeBundle: async (outputOptions: { dir?: string }) => {
        const outputDir = outputOptions.dir?.replace(resolve('.'), '.');
        if (outputDir === serverDir) {
          await cpy('./src/server/db/generated/**/*.node', resolve(serverDir));
        }
      },
    }),
  };
}
