import { cardAnatomy as parts } from '@chakra-ui/anatomy';
import {
  createMultiStyleConfigHelpers,
  cssVar,
} from '@chakra-ui/styled-system';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const $bg = cssVar('card-bg');

const variants = {
  elevated: definePartsStyle({
    container: {
      _dark: {
        [$bg.variable]: 'colors.gray.800',
      },
    },
  }),

  filled: definePartsStyle({
    container: {
      _dark: {
        [$bg.variable]: 'colors.gray.900',
      },
    },
  }),
};

export const cardTheme = defineMultiStyleConfig({
  variants,
  baseStyle: {
    container: {
      boxShadow: 'card',
    },
  },
});
