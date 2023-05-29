import { defineStyleConfig } from '@chakra-ui/react';
import { getColor } from '@chakra-ui/theme-tools';

export const textareaTheme = defineStyleConfig({
  variants: {
    outline: (props) => {
      return {
        bg: 'blackAlpha.50',
        borderColor: 'blackAlpha.100',
        _focusVisible: {
          borderColor: props.focusBorderColor ?? 'brand.500',
          boxShadow: `0 0 0 1px ${getColor(
            props.theme,
            props.focusBorderColor ?? 'brand.500'
          )}`,
        },
        _dark: {
          bg: 'whiteAlpha.50',
          borderColor: 'whiteAlpha.100',
          _focusVisible: {
            borderColor: props.focusBorderColor ?? 'brand.300',
            boxShadow: `0 0 0 1px ${getColor(
              props.theme,
              props.focusBorderColor ?? 'brand.300'
            )}`,
          },
        },
      };
    },
  },
});
