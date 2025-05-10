import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/page-error';

import { GuardPublicOnly } from '@/features/auth/guard-public-only';
import { LayoutLogin } from '@/features/auth/layout-login';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  notFoundComponent: () => <PageError errorCode={404} />,
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
