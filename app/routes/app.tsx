import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/page-error';

import { LayoutApp } from '@/features/app/layout-app';
import { GuardAuthenticated } from '@/features/auth/guard-authenticated';

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  notFoundComponent: () => <PageError errorCode={404} />,
});

function RouteComponent() {
  return (
    <GuardAuthenticated permissionApps={['app']}>
      <LayoutApp>
        <Outlet />
      </LayoutApp>
    </GuardAuthenticated>
  );
}
