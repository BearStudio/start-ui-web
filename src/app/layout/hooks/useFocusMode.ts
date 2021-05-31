import { useEffect } from 'react';

import { useLayoutContext } from '@/app/layout';

export const useFocusMode = (enabled = true) => {
  const ctx = useLayoutContext();
  const { setIsFocusMode } = ctx || {};

  useEffect(() => {
    if (!ctx) return () => undefined;
    setIsFocusMode(enabled);
    return () => setIsFocusMode(false);
  }, [ctx, setIsFocusMode, enabled]);
};
