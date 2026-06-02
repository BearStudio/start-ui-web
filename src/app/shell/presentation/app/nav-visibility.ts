import { useLayoutEffect } from 'react';
import { create } from 'zustand';

type ShouldShowNavMode = 'all' | 'desktop-only' | 'none';

interface ShouldShowNavState {
  mode: ShouldShowNavMode;
  update: (shouldShowNav: ShouldShowNavMode) => void;
}

export const useShouldShowNavStore = create<ShouldShowNavState>()((set) => ({
  mode: 'all',
  update: (shouldShowNav) => {
    set({
      mode: shouldShowNav,
    });
  },
}));

export const useShouldShowNav = (shouldShowNav: ShouldShowNavMode) => {
  const update = useShouldShowNavStore((s) => s.update);
  useLayoutEffect(() => {
    update(shouldShowNav);
    return () => update('all');
  }, [update, shouldShowNav]);
};
