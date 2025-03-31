import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/page-error';

import { GuardAuthenticated } from '@/features/auth/guard-authenticated';
import { LayoutManager } from '@/features/manager/layout-manager';

export const Route = createFileRoute('/manager')({
  component: RouteComponent,
  notFoundComponent: () => <PageError errorCode={404} />,
});

function RouteComponent() {
  return (
    <GuardAuthenticated permissionApps={['manager']}>
      <LayoutManager>
        <Outlet />
      </LayoutManager>
    </GuardAuthenticated>
  );
}
