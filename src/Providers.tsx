import React from 'react';

import { ChakraProvider } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';

import { AuthProvider } from '@/app/auth/AuthContext';
import '@/config';
import { mockServer } from '@/mocks/server';
import theme from '@/theme';

import { RTL_LANGUAGES } from './constants/i18n';

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  mockServer();
}

const queryClient = new QueryClient();

export const Providers = ({ children }) => {
  const { i18n } = useTranslation();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChakraProvider
          theme={{
            ...theme,
            direction: RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr',
          }}
        >
          {children}
        </ChakraProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
