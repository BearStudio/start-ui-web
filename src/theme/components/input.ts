import { mode } from '@chakra-ui/theme-tools';

export default {
  variants: {
    outline: (props) => ({
      field: {
        bg: mode('blackAlpha.50', 'whiteAlpha.50')(props),
        borderColor: mode('blackAlpha.100', 'whiteAlpha.100')(props),
      },
    }),
  },
};
