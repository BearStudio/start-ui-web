import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
      webpackConfig: {
        mode: 'development',
        devtool: false,
        module: {
          rules: [
            // application and Cypress files are bundled like React components
            // and instrumented using the babel-plugin-istanbul
            {
              test: /\.(tsx|ts)$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['next/babel'],
                  plugins: [
                    // we could optionally insert this plugin
                    // only if the code coverage flag is on
                    'istanbul',
                  ],
                },
              },
            },
          ],
        },
      },
    },
    reporterOptions: {
      mochaFile: 'cypress/reports/ct-junit-[hash].xml',
      toConsole: true,
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
  },

  e2e: {
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
});
