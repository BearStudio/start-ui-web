import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/errors/page-error';

import { Layout } from '@/layout/app/layout';
import { GuardAuthenticated } from '@/modules/auth/presentation';

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
