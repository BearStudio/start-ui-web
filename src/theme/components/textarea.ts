export const textareaTheme = {
  defaultProps: {
    focusBorderColor: 'brand.500',
  },
  variants: {
    outline: () => {
      return {
        bg: 'white',
        borderColor: 'gray.200',
        boxShadow: 'sm',
        _dark: {
          bg: 'whiteAlpha.50',
          borderColor: 'whiteAlpha.100',
        },
      };
    },
  },
};
