import { ReactNode } from 'react';

import { SidebarManager } from '@/features/manager/sidebar-manager';

export const LayoutManager = (props: { children?: ReactNode }) => {
  return (
    <div className="flex flex-1 flex-col" data-testid="layout-manager">
      <SidebarManager>{props.children}</SidebarManager>
    </div>
  );
};
