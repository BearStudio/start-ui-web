'use client';

import { ReactNode } from 'react';

import { ColorModeScript } from '@chakra-ui/react';

import { LoginModalInterceptor } from '@/app/LoginModalInterceptor';
import { Providers } from '@/app/Providers';
import { Viewport } from '@/components/Viewport';
import i18n from '@/config/i18next';
import { AVAILABLE_LANGUAGES } from '@/constants/i18n';
import { EnvDevHint } from '@/layout/EnvDevHint';
import { theme } from '@/theme/theme';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={i18n.language}
      dir={
        AVAILABLE_LANGUAGES.find(({ key }) => key === i18n.language)?.dir ??
        'ltr'
      }
    >
      <head>
        <title>Start UI</title>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/safari-pinned-tab.svg"
          color={theme.colors.gray?.['800']}
        />
        <meta
          name="msapplication-TileColor"
          content={theme.colors.gray?.['800']}
        />
        <meta name="theme-color" content={theme.colors.gray?.['800']} />
      </head>
      <body>
        {/* https://github.com/chakra-ui/chakra-ui/issues/7040 */}
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Providers>
          <Viewport>{children}</Viewport>
          <LoginModalInterceptor />
          <EnvDevHint />
        </Providers>
      </body>
    </html>
  );
}
