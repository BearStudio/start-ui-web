import { useContext, useEffect } from 'react';

import { LayoutContext } from '../Layout';

export const useFocusMode = (enabled = true) => {
  const ctx = useContext(LayoutContext);
  const { setIsFocusMode } = ctx || {};

  useEffect(() => {
    if (!ctx) return () => {};
    setIsFocusMode(enabled);
    return () => setIsFocusMode(false);
  }, [ctx, setIsFocusMode, enabled]);
};
