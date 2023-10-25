import React, { useEffect } from 'react';

import { Box, useColorMode } from '@chakra-ui/react';
import { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from 'storybook-dark-mode';

import { Providers } from '../src/app/Providers';
import i18nGlobal from '../src/lib/i18n/client';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '../src/lib/i18n/constants';

const queryClient = new QueryClient();

const DocumentationWrapper = ({ children, context, isDarkMode }) => {
  const { i18n } = useTranslation();
  const { colorMode, setColorMode } = useColorMode();

  // Update color mode
  useEffect(() => {
    // Add timeout to prevent unsync color mode between docs and classic modes
    const timer = setTimeout(() => {
      if (isDarkMode) {
        setColorMode('dark');
      } else {
        setColorMode('light');
      }
    });
    return () => clearTimeout(timer);
  }, [isDarkMode]);

  // Update language
  useEffect(() => {
    i18n.changeLanguage(context.globals.locale);
  }, [context.globals.locale]);

  return (
    <Box
      id="start-ui-storybook-wrapper"
      p="4"
      pb="8"
      bg={colorMode === 'dark' ? 'gray.900' : 'white'}
      flex="1"
    >
      {children}
    </Box>
  );
};

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      defaultValue: DEFAULT_LANGUAGE_KEY,
      toolbar: {
        icon: 'globe',
        items: AVAILABLE_LANGUAGES.map(({ key }) => ({
          value: key,
          title: i18nGlobal.t(`languages.${String(key)}`),
        })),
      },
    },
  },
  parameters: {
    options: {
      storySort: {
        order: ['StyleGuide', 'Components', 'Fields', 'App Layout'],
      },
    },
    darkMode: {
      dark: themes.dark,
      light: themes.light,
    },
    layout: 'fullscreen',
    backgrounds: { disable: true, grid: { disable: true } },
  },
  decorators: [
    (story, context) => {
      const isDarkMode = useDarkMode();
      return (
        <Providers>
          <QueryClientProvider client={queryClient}>
            <DocumentationWrapper isDarkMode={isDarkMode} context={context}>
              {/* Calling as a function to avoid errors. Learn more at:
               * https://github.com/storybookjs/storybook/issues/15223#issuecomment-1092837912
               */}
              {story(context)}
            </DocumentationWrapper>
          </QueryClientProvider>
        </Providers>
      );
    },
  ],
};

export default preview;
