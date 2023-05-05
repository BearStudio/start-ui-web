import { ColorModeScript } from '@chakra-ui/react';
import NextDocument, { Head, Html, Main, NextScript } from 'next/document';

import i18n from '@/config/i18next';
import { AVAILABLE_LANGUAGES } from '@/constants/i18n';
import theme from '@/theme';

export default class Document extends NextDocument {
  render() {
    return (
      <Html
        lang={i18n.language}
        dir={
          AVAILABLE_LANGUAGES.find(({ key }) => key === i18n.language)?.dir ??
          'ltr'
        }
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
