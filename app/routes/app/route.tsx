import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/page-error';

import { GuardAuthenticated } from '@/features/auth/guard-authenticated';
import { Layout } from '@/layout/app/layout';

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  notFoundComponent: () => <PageError error="404" />,
  errorComponent: () => <PageError error="500" />,
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
