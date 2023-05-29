import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

const variantPrimary = defineStyle((props) => ({
  bg: `${props.colorScheme}.600`,
  color: 'white',
  _hover: {
    bg: `${props.colorScheme}.700`,
    color: 'white',
    _disabled: {
      bg: `${props.colorScheme}.600`,
      color: 'white',
    },
  },
  _active: { bg: `${props.colorScheme}.800` },
  _focusVisible: {
    ringColor: `${props.colorScheme}.500`,
  },

  _dark: {
    bg: `${props.colorScheme}.300`,
    color: `${props.colorScheme}.900`,
    _hover: {
      bg: `${props.colorScheme}.400`,
      color: `${props.colorScheme}.900`,
      _disabled: {
        bg: `${props.colorScheme}.300`,
        color: `${props.colorScheme}.900`,
      },
    },
    _active: {
      bg: `${props.colorScheme}.500`,
    },
  },
}));

const variantSecondary = defineStyle((props) => ({
  bg: 'white',
  color: `${props.colorScheme}.600`,
  border: '1px solid',
  borderColor: 'gray.200',
  _hover: {
    bg: `${props.colorScheme}.50`,
    borderColor: `${props.colorScheme}.200`,
    _disabled: {
      bg: 'white',
      borderColor: 'gray.200',
    },
  },
  _active: {
    bg: `${props.colorScheme}.100`,
  },
  _focusVisible: {
    ringColor: `${props.colorScheme}.500`,
  },

  _dark: {
    bg: 'gray.800',
    color: props.colorScheme === 'gray' ? 'white' : `${props.colorScheme}.400`,
    borderColor: 'gray.700',
    _hover: {
      bg: 'gray.900',
      borderColor: `${props.colorScheme}.700`,
      _disabled: {
        bg: 'gray.800',
        borderColor: 'gray.700',
      },
    },
    _active: {
      bg: 'gray.800',
    },
  },
}));

export const buttonTheme = defineStyleConfig({
  baseStyle: (props) => ({
    _focusVisible: {
      boxShadow: 'none',
      ring: '2px',
      ringOffset: '2px',
      ringColor: `${props.colorScheme}.500`,
    },
    // Disabled Style
    ...(props.isDisabled
      ? {
          _disabled: {
            opacity: 0.8,
            border: '1px solid!',
            bg: 'blackAlpha.50!',
            borderColor: 'blackAlpha.50!',
            color: 'blackAlpha.300!',
            _dark: {
              opacity: 1,
              bg: 'whiteAlpha.50!',
              borderColor: 'whiteAlpha.50!',
              color: 'whiteAlpha.300!',
            },
          },
        }
      : { _disabled: {} }),
  }),
  variants: {
    // Custom variants
    '@primary': (props) => variantPrimary({ ...props, colorScheme: 'brand' }),
    '@secondary': (props) =>
      variantSecondary({ ...props, colorScheme: 'brand' }),
    '@danger': (props) => variantSecondary({ ...props, colorScheme: 'error' }),
    // Default variants
    solid: (props) =>
      props.colorScheme === 'gray' ? variantSecondary(props) : {},
    outline: variantSecondary,
    ghost: (props) => ({
      bg: transparentize(`${props.colorScheme}.500`, 0.05)(props.theme),
      _hover: {
        bg: transparentize(`${props.colorScheme}.500`, 0.15)(props.theme),
      },
    }),
  },
});
