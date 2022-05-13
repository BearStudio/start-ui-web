import React, { FC, useEffect, useState } from 'react';

import { ChakraProvider } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';

import { AuthProvider } from '@/app/auth/AuthContext';
import '@/config';
import theme from '@/theme';

import { AVAILABLE_LANGUAGES } from './constants/i18n';

const queryClient = new QueryClient();

const useMocksServer = () => {
  const [isLoadingMocks, setIsLoadingMocks] = useState(
    !process.env.NEXT_PUBLIC_API_BASE_URL
  );

  useEffect(() => {
    (async () => {
      if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        const { mockServer } = await import('@/mocks/server');
        mockServer();
        setIsLoadingMocks(false);
      }
    })();
  }, []);

  return { isLoadingMocks };
};

export const Providers: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const { isLoadingMocks } = useMocksServer();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChakraProvider
          theme={{
            ...theme,
            direction:
              AVAILABLE_LANGUAGES.find(({ key }) => key === i18n.language)
                ?.dir ?? 'ltr',
          }}
        >
          {!isLoadingMocks && children}
        </ChakraProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
