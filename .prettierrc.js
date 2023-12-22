// Prettier configuration. Please avoid changing the current configuration.
// But if you do so, please run the `npm run pretty` command.
/** @type {import("prettier").Options} */
const config = {
  endOfLine: 'lf',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  arrowParens: 'always',
  importOrder: ['^react$', '^(?!^react$|^@/|^[./]).*', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['jsx', 'typescript'],
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};

module.exports = config;
