import { useContext, useEffect } from 'react';

import { LayoutContext } from './Layout';

export const useFocusMode = (enabled = true) => {
  const { setIsFocusMode } = useContext(LayoutContext);

  useEffect(() => {
    setIsFocusMode(enabled);
    return () => setIsFocusMode(false);
  }, [setIsFocusMode, enabled]);
};
