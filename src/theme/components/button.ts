import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

const variantPrimary = defineStyle((props) => ({
  bg: `${props.colorScheme}.600`,
  color: 'white',
  _focusVisible: {
    boxShadow: 'outline-brand',
  },
  _hover: {
    bg: `${props.colorScheme}.700`,
    color: 'white',
    _disabled: {
      bg: `${props.colorScheme}.600`,
    },
  },
  _active: { bg: `${props.colorScheme}.800` },
  _dark: {
    bg: `${props.colorScheme}.300`,
    color: `${props.colorScheme}.900`,
    _focusVisible: {
      boxShadow: 'outline-brand',
    },
    _hover: {
      bg: `${props.colorScheme}.400`,
      color: `${props.colorScheme}.900`,
      _disabled: {
        bg: `${props.colorScheme}.300`,
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
  },
  _disabled: {
    _hover: {
      borderColor: 'gray.200',
    },
  },
  _dark: {
    bg: 'gray.800',
    color: `${props.colorScheme}.500`,
    borderColor: 'gray.700',
    _hover: {
      bg: 'gray.900',
      borderColor: `${props.colorScheme}.700`,
    },
    _disabled: {
      _hover: {
        borderColor: 'gray.700',
      },
    },
  },
}));

export const buttonTheme = defineStyleConfig({
  baseStyle: (props) =>
    // Disabled Style
    props.isDisabled
      ? {
          _disabled: {
            opacity: 0.8,
            border: '1px solid!',
            bg: 'blackAlpha.50!',
            borderColor: 'blackAlpha.50!',
            color: 'blackAlpha.300!',
            textDecoration: 'line-through',
            _dark: {
              opacity: 1,
              bg: 'whiteAlpha.50!',
              borderColor: 'whiteAlpha.50!',
              color: 'whiteAlpha.300!',
            },
          },
        }
      : { _disabled: {} },
  variants: {
    // Custom variants
    '@primary': (props) => ({
      ...variantPrimary({ ...props, colorScheme: 'brand' }),
      _focusVisible: {
        boxShadow: 'outline-brand',
      },
    }),
    '@secondary': (props) => ({
      ...variantSecondary({ ...props, colorScheme: 'brand' }),
      _focusVisible: {
        boxShadow: 'outline-brand',
      },
    }),
    '@danger': (props) => ({
      ...variantSecondary({ ...props, colorScheme: 'error' }),
      _focusVisible: {
        boxShadow: 'outline-error',
      },
    }),
    // Default variants
    outline: variantSecondary,
    ghost: (props) => ({
      bg: transparentize(`${props.colorScheme}.500`, 0.05)(props.theme),
      _hover: {
        bg: transparentize(`${props.colorScheme}.500`, 0.15)(props.theme),
      },
    }),
  },
});
