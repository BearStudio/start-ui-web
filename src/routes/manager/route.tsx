import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/platform/components/errors/page-error';

import {
  isForbiddenRouteContext,
  isForbiddenRouteError,
  requireAuthenticatedRouteOrForbidden,
} from '@/modules/auth/presentation';
import { ManagerLayout as Layout } from '@/app/shell/presentation';

export const Route = createFileRoute('/manager')({
  beforeLoad: ({ context, location }) =>
    requireAuthenticatedRouteOrForbidden({
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
  const context = Route.useRouteContext();

  if (isForbiddenRouteContext(context)) {
    return <PageError type="403" />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
