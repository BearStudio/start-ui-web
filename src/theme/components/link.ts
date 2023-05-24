import { defineStyleConfig } from '@chakra-ui/react';

export default defineStyleConfig({
  baseStyle: {
    textDecoration: 'underline',
    fontWeight: 'medium',
    _hover: {
      textDecoration: 'none',
    },
  },
});
