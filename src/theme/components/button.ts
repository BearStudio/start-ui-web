import { mode, transparentize } from '@chakra-ui/theme-tools';

const customVariant = ({
  bg,
  bgHover = bg,
  bgActive = bgHover,
  color,
  colorHover = color,
  boxShadowFocus = 'outline',
}) => {
  return {
    bg,
    color: color,
    _focus: {
      boxShadow: boxShadowFocus,
    },
    _hover: {
      bg: bgHover,
      color: colorHover,
      _disabled: {
        bg,
      },
    },
    _active: { bg: bgActive },
  };
};

export default {
  variants: {
    // Custom variants
    '@primary': (props) =>
      customVariant({
        bg: mode('brand.500', 'brand.300')(props),
        bgHover: mode('brand.600', 'brand.400')(props),
        bgActive: mode('brand.700', 'brand.500')(props),
        color: mode('white', 'brand.900')(props),
        boxShadowFocus: 'outline-brand',
      }),
    '@secondary': (props) =>
      customVariant({
        bg: mode('brand.50', 'brand.800')(props),
        bgHover: mode('brand.100', 'brand.700')(props),
        bgActive: mode('brand.200', 'brand.600')(props),
        color: mode('brand.600', 'brand.50')(props),
        colorHover: mode('brand.700', 'brand.100')(props),
        boxShadowFocus: 'outline-brand',
      }),
    '@danger': (props) =>
      customVariant({
        bg: mode('error.50', 'error.900')(props),
        bgHover: mode('error.100', 'error.800')(props),
        bgActive: mode('error.200', 'error.700')(props),
        color: mode('error.600', 'error.50')(props),
        colorHover: mode('error.700', 'error.100')(props),
        boxShadowFocus: 'outline-error',
      }),
    '@warning': (props) =>
      customVariant({
        bg: mode('warning.50', 'warning.900')(props),
        bgHover: mode('warning.100', 'warning.800')(props),
        bgActive: mode('warning.200', 'warning.700')(props),
        color: mode('warning.600', 'warning.50')(props),
        colorHover: mode('warning.700', 'warning.100')(props),
        boxShadowFocus: 'outline-warning',
      }),

    // Default variants
    solid: (props) => ({
      bg:
        props.colorScheme === 'gray'
          ? mode('gray.100', 'whiteAlpha.100')(props)
          : `${props.colorScheme}.600`,
      _hover: {
        bg:
          props.colorScheme === 'gray'
            ? mode('gray.200', 'whiteAlpha.200')(props)
            : `${props.colorScheme}.700`,
      },
    }),
    ghost: (props) => ({
      bg: transparentize(`${props.colorScheme}.50`, 0.05)(props.theme),
      _hover: {
        bg: transparentize(`${props.colorScheme}.50`, 0.15)(props.theme),
      },
    }),
  },
};
