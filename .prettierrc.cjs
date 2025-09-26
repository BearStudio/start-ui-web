// Prettier configuration. Please avoid changing the current configuration.
// But if you do so, please run the `npm run pretty` command.
/** @type {import("prettier").Options} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  endOfLine: 'lf',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  arrowParens: 'always',

  tailwindStylesheet: './src/styles/app.css',
  tailwindFunctions: ['cn', 'cva'],
};

// eslint-disable-next-line no-undef
module.exports = config;
