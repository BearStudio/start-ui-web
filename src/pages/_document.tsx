import { ColorModeScript } from '@chakra-ui/react';
import NextDocument, { Html, Head, Main, NextScript } from 'next/document';

import i18n from '@/config/i18next';
import { RTL_LANGUAGES } from '@/constants/i18n';
import theme from '@/theme';

export default class Document extends NextDocument {
  render() {
    return (
      <Html
        lang={i18n.language}
        dir={RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr'}
      >
        <Head />
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
