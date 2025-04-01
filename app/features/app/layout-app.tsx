import { ReactNode } from 'react';

import { MainNavDesktop } from '@/features/app/main-nav-desktop';
import { MainNavMobile } from '@/features/app/main-nav-mobile';

export const LayoutApp = (props: { children?: ReactNode }) => {
  return (
    <div className="flex flex-1 flex-col" data-testid="layout-app">
      <MainNavDesktop />
      <div className="flex flex-1 flex-col">{props.children}</div>
      <MainNavMobile />
    </div>
  );
};
