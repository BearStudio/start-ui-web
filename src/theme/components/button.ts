import {
  StyleFunctionProps,
  SystemStyleInterpolation,
  isAccessible,
  mode,
  transparentize,
} from '@chakra-ui/theme-tools';

type customVariantOptions = {
  theme: StyleFunctionProps['theme'];
  bg: string;
  bgHover?: string;
  bgActive?: string;
  color: string;
  colorHover?: string;
  boxShadowFocus?: string;
};
const customVariant = ({
  theme,
  bg,
  bgHover = bg,
  bgActive = bgHover,
  color,
  colorHover = color,
  boxShadowFocus = 'outline',
}: customVariantOptions) => {
  const isColorAccessible = isAccessible(color, bg, {
    size: 'large',
    level: 'AA',
  })(theme);

  return {
    bg,
    color: isColorAccessible ? color : 'black',
    _focusVisible: {
      boxShadow: boxShadowFocus,
    },
    _hover: {
      bg: bgHover,
      color: isColorAccessible ? colorHover : 'black',
      _disabled: {
        bg,
      },
    },
    _active: { bg: bgActive },
  };
};

const variants: Record<string, SystemStyleInterpolation> = {
  // Custom variants
  '@primary': (props) =>
    customVariant({
      theme: props.theme,
      bg: mode('brand.600', 'brand.300')(props),
      bgHover: mode('brand.700', 'brand.400')(props),
      bgActive: mode('brand.800', 'brand.500')(props),
      color: mode('white', 'brand.900')(props),
      boxShadowFocus: 'outline-brand',
    }),
  '@secondary': (props) =>
    customVariant({
      theme: props.theme,
      bg: mode('brand.100', 'brand.900')(props),
      bgHover: mode('brand.200', 'brand.800')(props),
      bgActive: mode('brand.300', 'brand.700')(props),
      color: mode('brand.700', 'brand.50')(props),
      colorHover: mode('brand.800', 'brand.100')(props),
      boxShadowFocus: 'outline-brand',
    }),
  '@danger': (props) =>
    customVariant({
      theme: props.theme,
      bg: mode('error.100', 'error.900')(props),
      bgHover: mode('error.200', 'error.800')(props),
      bgActive: mode('error.300', 'error.700')(props),
      color: mode('error.700', 'error.50')(props),
      colorHover: mode('error.800', 'error.100')(props),
      boxShadowFocus: 'outline-error',
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
};

export default {
  variants,
};
