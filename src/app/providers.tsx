import React, { FC, useEffect } from 'react';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import '@/config';
import { AVAILABLE_LANGUAGES } from '@/constants/i18n';
import { AuthProvider } from '@/spa/auth/AuthContext';
import theme from '@/theme';

const queryClient = new QueryClient();

const useMocksServer = () => {
  useEffect(() => {
    (async () => {
      if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        const { mockServer } = await import('@/mocks/server');
        mockServer();
      }
    })();
  }, []);
};

export const Providers: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  useMocksServer();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CacheProvider>
          <ChakraProvider
            theme={{
              ...theme,
              direction:
                AVAILABLE_LANGUAGES.find(({ key }) => key === i18n.language)
                  ?.dir ?? 'ltr',
            }}
          >
            {children}
          </ChakraProvider>
        </CacheProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
