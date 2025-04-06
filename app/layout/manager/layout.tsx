import { ReactNode } from 'react';

import { NavSidebar } from '@/layout/manager/nav-sidebar';

export const Layout = (props: { children?: ReactNode }) => {
  return (
    <div className="flex flex-1 flex-col" data-testid="layout-manager">
      <NavSidebar>{props.children}</NavSidebar>
    </div>
  );
};
