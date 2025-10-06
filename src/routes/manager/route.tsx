import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/page-error';

import { GuardAuthenticated } from '@/features/auth/guard-authenticated';
import { Layout } from '@/layout/manager/layout';

export const Route = createFileRoute('/manager')({
  component: RouteComponent,
  notFoundComponent: () => <PageError error="404" />,
  errorComponent: () => <PageError error="500" />,
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
