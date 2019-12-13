import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import {
  ThemeProvider,
  CSSReset,
} from "@chakra-ui/core";
import { theme } from 'lib-ui';

addDecorator((story) => (
  <ThemeProvider theme={theme}>
    <CSSReset />
    {story()}
  </ThemeProvider>
))

configure(require.context('../stories', true, /\.(stories\.)?(js|mdx)$/), module);
