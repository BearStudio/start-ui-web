import { defineStyleConfig } from '@chakra-ui/react';

export const linkTheme = defineStyleConfig({
  baseStyle: {
    textDecoration: 'underline',
    fontWeight: 'medium',
    _hover: {
      textDecoration: 'none',
    },
  },
});
