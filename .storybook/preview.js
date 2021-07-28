import React, { useEffect } from 'react';

import { useColorMode, Box } from '@chakra-ui/react';
import { themes } from '@storybook/theming';
import { BrowserRouter } from 'react-router-dom';
import { useDarkMode } from 'storybook-dark-mode';

import { Providers } from '../src/Providers';
import logoReversed from './logo-reversed.svg';
import logo from './logo.svg';

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

const DarkModeWrapper = ({ children }) => {
  const isDarkMode = useDarkMode();
  const { colorMode, setColorMode } = useColorMode();
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
  (Story) => (
    <Providers>
      <DarkModeWrapper>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </DarkModeWrapper>
    </Providers>
  ),
];
