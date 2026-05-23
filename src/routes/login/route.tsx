import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/platform/components/errors/page-error';

import { GuardPublicOnly, LayoutLogin } from '@/modules/auth/presentation';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: () => <PageError type="error-boundary" />,
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
