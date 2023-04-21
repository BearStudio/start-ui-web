const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-mdx-gfm',
  ],
  staticDir: ['../public'],
  typescript: {
    reactDocgen: false,
  },
  webpackFinal: (config) => {
    config.module.rules = config.module.rules ?? [];
    config.resolve.plugins = config.resolve.plugins ?? [];
    config.resolve.plugins.push(new TsconfigPathsPlugin());

    // Babel config
    config.module.rules.push({
      test: /\.([j|t]sx?)$/,
      loader: require.resolve('babel-loader'),
      options: {
        presets: ['next/babel'],
      },
    });

    // Fix Framer Motion v5 issue
    // https://github.com/framer/motion/issues/1307#issuecomment-966827629
    config.module.rules.push({
      type: 'javascript/auto',
      test: /\.mjs$/,
      include: /node_modules/,
    });
    return config;
  },
  docs: {
    autodocs: true,
  },
};
