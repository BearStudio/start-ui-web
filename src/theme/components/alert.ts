import { alertAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { getColor, transparentize } from '@chakra-ui/theme-tools';
import type { StyleFunctionProps } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(alertAnatomy.keys);

function getBg(props: StyleFunctionProps): { light: TODO; dark: string } {
  const { theme, colorScheme: c } = props;
  const light = getColor(theme, `${c}.100`, c);
  const dark = transparentize(`${c}.200`, 0.16)(theme);
  return { light, dark };
}

const variantSubtle = definePartsStyle((props) => {
  const { colorScheme } = props;
  const bg = getBg(props);

  return {
    container: {
      bg: bg.light,
      color: `${colorScheme}.800`,
      _dark: {
        bg: bg.dark,
        color: `${colorScheme}.200`,
      },
    },
    icon: {
      color: `${colorScheme}.500`,
      _dark: {
        color: `${colorScheme}.200`,
      },
    },
    spinner: {
      color: `${colorScheme}.500`,
      _dark: {
        color: `${colorScheme}.200`,
      },
    },
  };
});

const variantLeftAccent = definePartsStyle((props) => {
  const { colorScheme } = props;
  const bg = getBg(props);

  return {
    container: {
      paddingStart: 3,
      borderStartWidth: '4px',
      borderStartColor: `${colorScheme}.500`,
      bg: bg.light,
      _dark: {
        bg: bg.dark,
        borderStartColor: `${colorScheme}.200`,
      },
    },
    icon: {
      color: `${colorScheme}.500`,
      _dark: {
        color: `${colorScheme}.200`,
      },
    },
    spinner: {
      color: `${colorScheme}.500`,
      _dark: {
        color: `${colorScheme}.200`,
      },
    },
  };
});

const variantTopAccent = definePartsStyle((props) => {
  const { colorScheme } = props;
  return {
    container: {
      pt: 2,
      borderTopWidth: '4px',
      borderTopColor: `${colorScheme}.500`,
      bg: getBg(props),
      _dark: {
        borderTopColor: `${colorScheme}.200`,
      },
    },
    icon: {
      color: `${colorScheme}.500`,
      _dark: {
        color: `${colorScheme}.200`,
      },
    },
    spinner: {
      color: `${colorScheme}.500`,
      _dark: {
        color: `${colorScheme}.200`,
      },
    },
  };
});

const variantSolid = definePartsStyle((props) => {
  const { colorScheme: c } = props;
  return {
    container: {
      bg: `${c}.500`,
      color: 'white',
      _dark: {
        bg: `${c}.200`,
        color: 'gray.900',
      },
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
