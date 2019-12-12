import { theme } from "@chakra-ui/core";

export default {
  ...theme,
  colors: {
    ...theme.colors,
    // Go to https://smart-swatch.netlify.com/ to easily generate a new color
    // palette.
    brand: {
      50: '#e2fbf0',
      100: '#c2ebd8',
      200: '#9fddbd',
      300: '#7ccfa1',
      400: '#58c184',
      500: '#3ea771',
      600: '#2e825d',
      700: '#1f5d46',
      800: '#0f392c',
      900: '#00150d',
    },
  }
};
