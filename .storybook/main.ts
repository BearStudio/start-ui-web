import { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-dark-mode',
  ],
  staticDirs: ['../public'],
  docs: {
    autodocs: true,
  },
};

export default config;
