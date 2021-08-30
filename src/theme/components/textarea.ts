import { getColor, mode } from '@chakra-ui/theme-tools';

export default {
  variants: {
    outline: (props) => {
      const focusBorderColor = getColor(
        props.theme,
        props.focusBorderColor
          ? props.focusBorderColor
          : mode('brand.500', 'brand.300')(props)
      );
      return {
        bg: mode('blackAlpha.50', 'whiteAlpha.50')(props),
        borderColor: mode('blackAlpha.100', 'whiteAlpha.100')(props),
        _focus: {
          borderColor: focusBorderColor,
          boxShadow: `0 0 0 1px ${focusBorderColor}`,
        },
      };
    },
  },
};
