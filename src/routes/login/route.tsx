import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/page-error';

import { GuardPublicOnly } from '@/features/auth/guard-public-only';
import { LayoutLogin } from '@/features/auth/layout-login';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  notFoundComponent: () => <PageError error="404" />,
  errorComponent: () => <PageError error="500" />,
});

function RouteComponent() {
  return (
    <GuardPublicOnly>
      <LayoutLogin>
        <Outlet />
      </LayoutLogin>
    </GuardPublicOnly>
  );
}
