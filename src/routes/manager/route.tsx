import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/errors/page-error';

import { GuardAuthenticated } from '@/features/auth/guard-authenticated';
import { Layout } from '@/layout/manager/layout';

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
