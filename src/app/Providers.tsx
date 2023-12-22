import React, { FC } from 'react';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, createLocalStorageManager } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import '@/lib/dayjs/config';
import '@/lib/i18n/client';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';
import theme, { COLOR_MODE_STORAGE_KEY } from '@/theme';

const localStorageManager = createLocalStorageManager(COLOR_MODE_STORAGE_KEY);

export const Providers: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { i18n } = useTranslation();

  return (
    <CacheProvider>
      <ChakraProvider
        colorModeManager={localStorageManager}
        theme={{
          ...theme,
          direction:
            AVAILABLE_LANGUAGES.find(({ key }) => key === i18n.language)?.dir ??
            'ltr',
        }}
      >
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
};
