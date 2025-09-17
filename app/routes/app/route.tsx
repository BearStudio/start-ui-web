import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/page-error';

import { GuardAuthenticated } from '@/features/auth/guard-authenticated';

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  notFoundComponent: () => <PageError error="404" />,
  errorComponent: () => <PageError error="500" />,
});

function RouteComponent() {
  return (
    <GuardAuthenticated permissionApps={['app']}>
      <Outlet />
    </GuardAuthenticated>
  );
}
