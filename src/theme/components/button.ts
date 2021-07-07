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
    '@secondary': customVariant({
      bg: 'brand.50',
      bgHover: 'brand.100',
      bgActive: 'brand.200',
      color: 'brand.600',
      colorHover: 'brand.700',
      boxShadowFocus: 'outline-brand',
    }),
    '@danger': customVariant({
      bg: 'error.50',
      bgHover: 'error.100',
      bgActive: 'error.200',
      color: 'error.600',
      colorHover: 'error.700',
      boxShadowFocus: 'outline-error',
    }),
    '@warning': customVariant({
      bg: 'warning.50',
      bgHover: 'warning.100',
      bgActive: 'warning.200',
      color: 'warning.600',
      colorHover: 'warning.700',
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
