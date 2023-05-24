import { useEffect } from 'react';

import { useLayoutContext } from '@/layout/LayoutContext';

export const useFocusMode = (enabled = true) => {
  const ctx = useLayoutContext();
  const { setIsFocusMode } = ctx || {};

  useEffect(() => {
    setIsFocusMode?.(enabled);
    return () => setIsFocusMode?.(false);
  }, [ctx, setIsFocusMode, enabled]);
};
