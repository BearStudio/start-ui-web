import React, { FC } from 'react';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, createLocalStorageManager } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { AuthProvider } from '@/features/auth/AuthContext';
import '@/lib/axios/config';
import '@/lib/dayjs/config';
import '@/lib/i18n/config';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';
import theme, { COLOR_MODE_STORAGE_KEY } from '@/theme';

const queryClient = new QueryClient();

const localStorageManager = createLocalStorageManager(COLOR_MODE_STORAGE_KEY);

export const Providers: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { i18n } = useTranslation();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CacheProvider>
          <ChakraProvider
            colorModeManager={localStorageManager}
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
