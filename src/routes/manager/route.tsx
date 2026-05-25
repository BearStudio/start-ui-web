import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/platform/components/errors/page-error';

import {
  isForbiddenRouteError,
  requireAuthenticatedRoute,
} from '@/modules/auth/presentation';
import { ManagerLayout as Layout } from '@/modules/shell/presentation';

export const Route = createFileRoute('/manager')({
  beforeLoad: ({ context, location }) =>
    requireAuthenticatedRoute({
      context,
      location,
      permissionApps: ['manager'],
    }),
  component: RouteComponent,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: ({ error }) =>
    isForbiddenRouteError(error) ? (
      <PageError type="403" />
    ) : (
      <PageError type="error-boundary" />
    ),
});

function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
