import { defineStyleConfig } from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

export const buttonTheme = defineStyleConfig({
  variants: {
    // Custom variants
    '@primary': {
      bg: 'brand.600',
      color: 'white',
      _focusVisible: {
        boxShadow: 'outline-brand',
      },
      _hover: {
        bg: 'brand.700',
        color: 'white',
        _disabled: {
          bg: 'brand.600',
        },
      },
      _active: { bg: 'brand.800' },
      _dark: {
        bg: 'brand.300',
        color: 'brand.900',
        _focusVisible: {
          boxShadow: 'outline-brand',
        },
        _hover: {
          bg: 'brand.400',
          color: 'brand.900',
          _disabled: {
            bg: 'brand.300',
          },
        },
        _active: {
          bg: 'brand.500',
        },
      },
    },
    '@secondary': {
      bg: 'white',
      color: 'brand.600',
      border: '1px solid',
      borderColor: 'gray.200',
      _hover: {
        bg: 'brand.50',
        borderColor: 'brand.200',
      },
      _focusVisible: {
        boxShadow: 'outline-brand',
      },
      _disabled: {
        _hover: {
          borderColor: 'gray.200',
        },
      },
      _dark: {
        bg: 'gray.800',
        color: 'brand.400',
        borderColor: 'gray.700',
        _hover: {
          bg: 'gray.900',
          borderColor: 'brand.700',
        },
        _disabled: {
          _hover: {
            borderColor: 'gray.700',
          },
        },
      },
    },
    '@danger': {
      bg: 'white',
      color: 'error.700',
      border: '1px solid',
      borderColor: 'gray.200',
      _hover: {
        bg: 'error.50',
        borderColor: 'error.200',
      },
      _focusVisible: {
        boxShadow: 'outline-error',
      },
      _disabled: {
        _hover: {
          borderColor: 'gray.200',
        },
      },
      _dark: {
        bg: 'gray.800',
        color: 'error.500',
        borderColor: 'gray.700',
        _hover: {
          bg: 'gray.900',
          borderColor: 'error.700',
        },
        _disabled: {
          _hover: {
            borderColor: 'gray.700',
          },
        },
      },
    },
    // Default variants
    ghost: (props) => ({
      bg: transparentize(`${props.colorScheme}.500`, 0.05)(props.theme),
      _hover: {
        bg: transparentize(`${props.colorScheme}.500`, 0.15)(props.theme),
      },
    }),
  },
});
