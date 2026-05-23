import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/platform/components/errors/page-error';

import { GuardAuthenticated } from '@/modules/auth/presentation';
import { ManagerLayout as Layout } from '@/modules/shell/presentation';

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
