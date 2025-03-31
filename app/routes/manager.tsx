import { createFileRoute, Outlet } from '@tanstack/react-router';

import { GuardAuthenticated } from '@/features/auth/guard-authenticated';

export const Route = createFileRoute('/manager')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <GuardAuthenticated permissionApps={['manager']}>
      <Outlet />
    </GuardAuthenticated>
  );
}
