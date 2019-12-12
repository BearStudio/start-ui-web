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

// automatically import all files ending in *.stories.js or *.stories.mdx
configure(require.context('../stories', true, /\.stories\.(js|mdx)$/), module);
