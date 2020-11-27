import React from 'react';

import { useTheme } from '@chakra-ui/react';
import Head from 'next/head';

import { Providers } from '@/Providers';
import { Viewport } from '@/components';
import { ErrorBoundary } from '@/errors';

if (
  process.env.NODE_ENV !== 'production' &&
  !process.env.NEXT_PUBLIC_API_BASE_URL
) {
  require('../../mocks');
}

const AppHead = () => {
  const theme = useTheme();

  return (
    <Head>
      <meta
        name="viewport"
        content="initial-scale=1, viewport-fit=cover, user-scalable=no"
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
    </Head>
  );
};

const App = ({ Component, pageProps }) => {
  return (
    <Providers>
      <AppHead />
      <ErrorBoundary>
        <Viewport>
          <Component {...pageProps} />
        </Viewport>
      </ErrorBoundary>
    </Providers>
  );
};
export default App;
