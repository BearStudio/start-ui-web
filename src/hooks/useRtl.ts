import { useCallback } from 'react';

import { useTheme } from '@chakra-ui/react';

export const useRtl = () => {
  const { direction } = useTheme();

  const rtlValue = useCallback(
    (ltr, rtl) => (direction === 'rtl' ? rtl : ltr),
    [direction]
  );

  return {
    direction,
    rtlValue,
  };
};
