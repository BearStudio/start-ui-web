const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');
const toPath = (_path) => path.join(process.cwd(), _path);

module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-dark-mode/register',
  ],
  typescript: {
    reactDocgen: false,
  },
  webpackFinal: (config) => {
    config.resolve.plugins.push(new TsconfigPathsPlugin());
    config.resolve.alias = {
      ...config.resolve.alias,
      '@emotion/core': toPath('node_modules/@emotion/react'),
      'emotion-theming': toPath('node_modules/@emotion/react'),
    };
    config.module.rules.push({
      test: /\.([j|t]sx?)$/,
      loader: require.resolve('babel-loader'),
      options: {
        presets: ['next/babel'],
      },
    });
    return config;
  },
};
