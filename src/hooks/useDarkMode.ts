import { useCallback } from 'react';

import { useColorMode } from '@chakra-ui/react';

export const useDarkMode = () => {
  const { colorMode, toggleColorMode, setColorMode } = useColorMode();

  const colorModeValue = useCallback(
    (lightValue, darkValue) => (colorMode === 'dark' ? darkValue : lightValue),
    [colorMode]
  );

  return {
    toggleColorMode,
    setColorMode,
    colorModeValue,
    colorMode,
  };
};
