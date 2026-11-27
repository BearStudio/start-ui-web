import type { StorybookConfig } from '@storybook/tanstack-react';

const config: StorybookConfig = {
  stories: ['../**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@vueless/storybook-dark-mode',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/tanstack-react',
    options: {
      builder: {
        viteConfigPath: './vite.storybook.ts',
      },
    },
  },
};
export default config;
