import { ReactNode, useLayoutEffect } from 'react';
import { create } from 'zustand';

import { MainNavDesktop } from '@/layout/app/main-nav-desktop';
import { MainNavMobile } from '@/layout/app/main-nav-mobile';

export const Layout = (props: { children?: ReactNode }) => {
  const showMainNavDesktop = useShouldShowNavStore(
    (s) => s.mode === 'all' || s.mode === 'desktop-only'
  );
  const showMainNavMobile = useShouldShowNavStore((s) => s.mode === 'all');
  return (
    <div className="flex flex-1 flex-col" data-testid="layout-app">
      {showMainNavDesktop && <MainNavDesktop />}
      <div className="flex flex-1 flex-col">{props.children}</div>
      {showMainNavMobile && <MainNavMobile />}
    </div>
  );
};

type ShouldShowNavMode = 'all' | 'desktop-only' | 'none';

interface ShouldShowNavState {
  mode: ShouldShowNavMode;
  update: (shouldShowNav: ShouldShowNavMode) => void;
}

const useShouldShowNavStore = create<ShouldShowNavState>()((set) => ({
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
