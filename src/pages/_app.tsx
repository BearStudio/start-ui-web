import React from 'react';

import { Box, Text, useTheme } from '@chakra-ui/react';
import Head from 'next/head';

import { Providers } from '@/Providers';
import { Viewport } from '@/components';
import { ErrorBoundary } from '@/errors';

const AppDevHint = () => {
  const envName =
    process.env.NODE_ENV === 'development'
      ? 'Development'
      : process.env.NEXT_PUBLIC_DEV_ENV_NAME;
  const colorScheme =
    process.env.NODE_ENV === 'development'
      ? 'warning'
      : process.env.NEXT_PUBLIC_DEV_ENV_COLOR_SCHEME ?? 'orange';

  if (!envName) {
    return null;
  }

  return (
    <Box
      zIndex="100"
      position="fixed"
      top="0"
      insetStart="0"
      insetEnd="0"
      h="2px"
      bg={`${colorScheme}.400`}
    >
      <Text
        position="fixed"
        top="0"
        insetStart="4"
        bg={`${colorScheme}.400`}
        color={`${colorScheme}.900`}
        fontSize="0.6rem"
        fontWeight="bold"
        px="1"
        borderBottomStartRadius="sm"
        borderBottomEndRadius="sm"
        textTransform="uppercase"
      >
        {envName}
      </Text>
    </Box>
  );
};

const AppHead = () => {
  const theme = useTheme();

  return (
    <Head>
      <title>Start UI</title>
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
        <AppDevHint />
      </ErrorBoundary>
    </Providers>
  );
};
export default App;
