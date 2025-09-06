import colors from 'colors';
import { keys } from 'remeda';

import locales from './src/locales';

colors.disable();

const config = {
  input: ['src/**/*.{ts,tsx}'],
  output: 'i18n-keys.json',
  locales: keys(locales),
  sort: true,
  verbose: true,
  failOnWarnings: false,
  customValueTemplate: 'TODO: $KEY',

  // Fix for zod-i18n-map
  // https://github.com/blake-regalia/i18next-parser/issues/437
  plurals: false,
  context: false,
};

export default config;
