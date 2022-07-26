import {
  SystemStyleInterpolation,
  getColor,
  mode,
} from '@chakra-ui/theme-tools';

const variants: Record<string, SystemStyleInterpolation> = {
  outline: (props) => {
    const focusBorderColor = getColor(
      props.theme,
      props.focusBorderColor
        ? props.focusBorderColor
        : mode('brand.500', 'brand.300')(props)
    );
    return {
      field: {
        bg: mode('blackAlpha.50', 'whiteAlpha.50')(props),
        borderColor: mode('blackAlpha.100', 'whiteAlpha.100')(props),
        _focusVisible: {
          borderColor: focusBorderColor,
          boxShadow: `0 0 0 1px ${focusBorderColor}`,
        },
      },
    };
  },
};

export default {
  variants,
};
