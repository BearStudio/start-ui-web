import { popoverAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { cssVar } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  popoverAnatomy.keys
);

const $popperBg = cssVar('popper-bg');

export const popoverTheme = defineMultiStyleConfig({
  baseStyle: {
    content: {
      [$popperBg.variable]: 'colors.white',
      py: 3,
      maxW: '98vw',
      _dark: {
        [$popperBg.variable]: 'colors.gray.900',
      },
    },
    header: {
      px: 3,
      pt: 0,
      pb: 0,
      borderBottomWidth: 0,
      fontWeight: 'semibold',
    },
    body: {
      px: 3,
      py: 0,
    },
    footer: {
      px: 3,
      pb: 0,
      pt: 3,
      borderTopWidth: 0,
    },
    closeButton: {
      top: 1,
      insetEnd: 1,
      padding: 2,
    },
  },
  defaultProps: {
    size: 'xs',
  },
  sizes: {
    '3xs': {
      content: {
        width: '3xs',
      },
    },
    '2xs': {
      content: {
        width: '2xs',
      },
    },
    xs: {
      content: {
        width: 'xs',
      },
    },
    sm: {
      content: {
        width: 'sm',
      },
    },
    md: {
      content: {
        width: 'md',
      },
    },
    lg: {
      content: {
        width: 'lg',
      },
    },
    xl: {
      content: {
        width: 'xl',
      },
    },
    '2xl': {
      content: {
        width: '2xl',
      },
    },
    '3xl': {
      content: {
        width: '3xl',
      },
    },
    '4xl': {
      content: {
        width: '4xl',
      },
    },
    '5xl': {
      content: {
        width: '5xl',
      },
    },
    '6xl': {
      content: {
        width: '6xl',
      },
    },
    '7xl': {
      content: {
        width: '7xl',
      },
    },
    '8xl': {
      content: {
        width: '8xl',
      },
    },
  },
});
