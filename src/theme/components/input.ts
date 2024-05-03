export const inputTheme = {
  defaultProps: {
    focusBorderColor: 'brand.500',
  },
  variants: {
    outline: () => {
      return {
        field: {
          bg: 'white',
          borderColor: 'gray.200',
          boxShadow: 'sm',
          _dark: {
            bg: 'whiteAlpha.50',
            borderColor: 'whiteAlpha.100',
          },
          _disabled: {
            bg: 'blackAlpha.50',
            color: 'blackAlpha.600',
            opacity: 1,
            boxShadow: 'none',
            _dark: {
              color: 'whiteAlpha.600',
              bg: 'transparent',
            },
          },
        },
      };
    },
  },
  sizes: {
    sm: {
      field: {
        borderRadius: 'md',
      },
    },
  },
};
