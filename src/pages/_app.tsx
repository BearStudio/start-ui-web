import React from 'react';
import Head from 'next/head';
import { useTheme } from '@chakra-ui/react';
import { Providers } from '@/Providers';
import { Viewport } from '@/components/Viewport';
import { ErrorBoundary } from '@/errors';

if (process.env.NODE_ENV !== 'production') {
  require('../../mocks');
}

const AppHead = () => {
  const theme = useTheme();

  return (
    <Head>
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
        color={theme.colors.brand?.['600']}
      />
      <meta
        name="msapplication-TileColor"
        content={theme.colors.brand?.['600']}
      />
      <meta name="theme-color" content={theme.colors.brand?.['600']} />
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
