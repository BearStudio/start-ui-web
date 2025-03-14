import { createFileRoute, Outlet } from '@tanstack/react-router';

import { GuardPublicOnly } from '@/features/auth/guard-public-only';

export const Route = createFileRoute('/_public-only')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <GuardPublicOnly>
      <Outlet />
    </GuardPublicOnly>
  );
}
