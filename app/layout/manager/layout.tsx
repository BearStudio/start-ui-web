import { ReactNode } from 'react';

import { MainSidebar } from '@/layout/manager/main-sidebar';

export const Layout = (props: { children?: ReactNode }) => {
  return (
    <div className="flex flex-1 flex-col" data-testid="layout-manager">
      <MainSidebar>{props.children}</MainSidebar>
    </div>
  );
};
