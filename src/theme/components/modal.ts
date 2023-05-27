import { modalAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  modalAnatomy.keys
);

/**
 * Since the `maxWidth` prop references theme.sizes internally,
 * we can leverage that to size our modals.
 */
function getSize(value: string) {
  if (value === 'full') {
    return {
      dialog: {
        maxW: '100vw',
        minH: '100vh',
        '@supports(min-height: -webkit-fill-available)': {
          minH: '-webkit-fill-available',
        },
        '@supports(min-height: fill-available)': {
          minH: 'fill-available',
        },
        m: 0,
        borderRadius: 0,
      },
    };
  }
  return {
    dialog: { maxW: value },
  };
}

export const modalTheme = defineMultiStyleConfig({
  baseStyle: {
    overlay: {
      backdropFilter: 'blur(4px)',
    },
    dialog: {
      bg: 'white',
      mx: 4,
      py: 0,
      _dark: {
        bg: 'gray.800',
      },
    },
    header: {
      px: 4,
      pt: 4,
      pb: 0,
    },
    closeButton: {
      top: 2,
      insetEnd: 2,
    },
    body: {
      px: 4,
      py: 4,
    },
    footer: {
      px: 4,
      pt: 0,
      pb: 4,
    },
  },
  sizes: {
    xs: getSize('xs'),
    sm: getSize('sm'),
    md: getSize('md'),
    lg: getSize('lg'),
    xl: getSize('xl'),
    '2xl': getSize('2xl'),
    '3xl': getSize('3xl'),
    '4xl': getSize('4xl'),
    '5xl': getSize('5xl'),
    '6xl': getSize('6xl'),
    full: getSize('full'),
  },
  defaultProps: {
    size: 'md',
  },
});
