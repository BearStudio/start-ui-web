import React, { useEffect } from 'react';

import { useColorMode, Box } from '@chakra-ui/react';
import { themes } from '@storybook/theming';
import { useTranslation } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { useDarkMode } from 'storybook-dark-mode';

import { Providers } from '../src/Providers';
import i18nGlobal from '../src/config/i18next';
import { DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES } from '../src/constants/i18n';
import logoReversed from './logo-reversed.svg';
import logo from './logo.svg';

// .storybook/preview.js

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    defaultValue: DEFAULT_LANGUAGE,
    toolbar: {
      icon: 'globe',
      items: AVAILABLE_LANGUAGES.map((langKey) => ({
        value: langKey,
        title: i18nGlobal.t(`languages.${langKey}`),
      })),
    },
  },
};

export const parameters = {
  options: {
    storySort: {
      order: ['StyleGuide', 'Components', 'Fields', 'App Layout'],
    },
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  darkMode: {
    dark: {
      ...themes.dark,
      brandImage: logoReversed,
      brandTitle: 'Start UI',
    },
    light: {
      ...themes.light,
      brandImage: logo,
      brandTitle: 'Start UI',
    },
  },
  layout: 'fullscreen',
  backgrounds: { disable: true, grid: { disable: true } },
};

const DocumentationWrapper = ({ children, context }) => {
  const { i18n } = useTranslation();
  const isDarkMode = useDarkMode();
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

export const decorators = [
  (Story, context) => (
    <Providers>
      <BrowserRouter>
        <DocumentationWrapper context={context}>
          <Story {...context} />
        </DocumentationWrapper>
      </BrowserRouter>
    </Providers>
  ),
];
