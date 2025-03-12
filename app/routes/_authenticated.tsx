import { createFileRoute, Outlet } from '@tanstack/react-router';

import { GuardAuthenticated } from '@/features/auth/guard-authenticated';

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <GuardAuthenticated redirect="/">
      <Outlet />
    </GuardAuthenticated>
  );
}
