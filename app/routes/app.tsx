import { createFileRoute, Outlet } from '@tanstack/react-router';

import { GuardAuthenticated } from '@/features/auth/guard-authenticated';

export const Route = createFileRoute('/app')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <GuardAuthenticated permissionApps={['app']}>
      <Outlet />
    </GuardAuthenticated>
  );
}
