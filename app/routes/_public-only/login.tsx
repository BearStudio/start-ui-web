import { createFileRoute, Outlet } from '@tanstack/react-router';

import { LayoutLogin } from '@/features/auth/layout-login';

export const Route = createFileRoute('/_public-only/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LayoutLogin>
      <Outlet />
    </LayoutLogin>
  );
}
