module.exports = {
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-dark-mode',
  ],
  features: {
    emotionAlias: false,
  },
  staticDir: ['../public'],
  docs: {
    autodocs: true,
  },
};
