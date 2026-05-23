import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/platform/components/errors/page-error';

import { GuardAuthenticated } from '@/modules/auth/presentation';
import { AppLayout as Layout } from '@/modules/shell/presentation';

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: () => <PageError type="error-boundary" />,
});

function RouteComponent() {
  return (
    <GuardAuthenticated permissionApps={['app']}>
      <Layout>
        <Outlet />
      </Layout>
    </GuardAuthenticated>
  );
}
