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

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },

  refs: {
    // Disable Chakra UI storybook composition as it fetches the v3.
    // I did not find the URL of the v2 at the moment to replace it.
    '@chakra-ui/react': { disable: true },
  },
};

export default config;
