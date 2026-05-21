import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/errors/page-error';

import { Layout } from '@/layout/manager/layout';
import { GuardAuthenticated } from '@/modules/auth/presentation';

export const Route = createFileRoute('/manager')({
  component: RouteComponent,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: () => <PageError type="error-boundary" />,
});

function RouteComponent() {
  return (
    <GuardAuthenticated permissionApps={['manager']}>
      <Layout>
        <Outlet />
      </Layout>
    </GuardAuthenticated>
  );
}
