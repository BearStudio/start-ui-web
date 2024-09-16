'use client';

import { ReactNode } from 'react';

import { ColorModeScript } from '@chakra-ui/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Providers } from '@/app/Providers';
import { Viewport } from '@/components/Viewport';
import { EnvHint } from '@/features/devtools/EnvHint';
import { useLocale } from '@/lib/i18n/useLocale';
import { TrpcProvider } from '@/lib/trpc/TrpcProvider';
import theme, { COLOR_MODE_STORAGE_KEY } from '@/theme';

export const Document = ({ children }: { children: ReactNode }) => {
  const locale = useLocale();

  return (
    <html lang={locale?.lang} dir={locale?.dir}>
      <head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
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
        <ColorModeScript
          initialColorMode={theme.config.initialColorMode}
          storageKey={COLOR_MODE_STORAGE_KEY}
        />
        <Providers>
          <TrpcProvider>
            <Viewport>{children}</Viewport>
            <EnvHint />
            <ReactQueryDevtools initialIsOpen={false} />
          </TrpcProvider>
        </Providers>
      </body>
    </html>
  );
};
