import { useContext, useEffect } from 'react';

import { LayoutContext } from '@/app/layout';

export const useFocusMode = (enabled = true) => {
  const ctx = useContext(LayoutContext);
  const { setIsFocusMode } = ctx || {};

  useEffect(() => {
    if (!ctx) return () => undefined;
    setIsFocusMode(enabled);
    return () => setIsFocusMode(false);
  }, [ctx, setIsFocusMode, enabled]);
};
