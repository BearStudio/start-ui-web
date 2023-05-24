import { alertAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { getColor, mode, transparentize } from '@chakra-ui/theme-tools';
import type { StyleFunctionProps } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(alertAnatomy.keys);

function getBg(props: StyleFunctionProps): string {
  const { theme, colorScheme: c } = props;
  const lightBg = getColor(theme, `${c}.100`, c);
  const darkBg = transparentize(`${c}.200`, 0.16)(theme);
  return mode(lightBg, darkBg)(props);
}

const variantSubtle = definePartsStyle((props) => {
  const { colorScheme: c } = props;
  return {
    container: {
      bg: getBg(props),
      color: mode(`${c}.800`, `${c}.200`)(props),
    },
    icon: { color: mode(`${c}.500`, `${c}.200`)(props) },
    spinner: {
      color: mode(`${c}.500`, `${c}.200`)(props),
    },
  };
});

const variantLeftAccent = definePartsStyle((props) => {
  const { colorScheme: c } = props;
  return {
    container: {
      paddingStart: 3,
      borderStartWidth: '4px',
      borderStartColor: mode(`${c}.500`, `${c}.200`)(props),
      bg: getBg(props),
    },
    icon: {
      color: mode(`${c}.500`, `${c}.200`)(props),
    },
    spinner: {
      color: mode(`${c}.500`, `${c}.200`)(props),
    },
  };
});

const variantTopAccent = definePartsStyle((props) => {
  const { colorScheme: c } = props;
  return {
    container: {
      pt: 2,
      borderTopWidth: '4px',
      borderTopColor: mode(`${c}.500`, `${c}.200`)(props),
      bg: getBg(props),
    },
    icon: {
      color: mode(`${c}.500`, `${c}.200`)(props),
    },
    spinner: {
      color: mode(`${c}.500`, `${c}.200`)(props),
    },
  };
});

const variantSolid = definePartsStyle((props) => {
  const { colorScheme: c } = props;
  return {
    container: {
      bg: mode(`${c}.500`, `${c}.200`)(props),
      color: mode(`white`, `gray.900`)(props),
    },
  };
});

export const alertTheme = defineMultiStyleConfig({
  baseStyle: {
    container: {
      py: 2,
      borderRadius: 'md',
      fontSize: 'sm',
      flexWrap: 'wrap',
    },
    title: {
      lineHeight: 6,
      marginEnd: 2,
    },
    description: {
      lineHeight: 5,
    },
    icon: {
      flexShrink: 0,
      marginEnd: 2,
      w: 4,
      h: 4,
    },
    spinner: {
      flexShrink: 0,
      marginEnd: 2,
      w: 4,
      h: 4,
    },
  },
  variants: {
    subtle: variantSubtle,
    'left-accent': variantLeftAccent,
    'top-accent': variantTopAccent,
    solid: variantSolid,
  },
  defaultProps: {
    variant: 'subtle',
    colorScheme: 'blue',
  },
});
