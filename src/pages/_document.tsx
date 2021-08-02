import { ColorModeScript } from '@chakra-ui/react';
import NextDocument, { Html, Head, Main, NextScript } from 'next/document';

import i18n from '@/config/i18next';
import theme from '@/theme';

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang={i18n.language}>
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
