import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/platform/components/errors/page-error';
import { RouteError } from '@/platform/components/errors/route-error';

import { ManagerLayout as Layout } from '@/app/shell/presentation';
import {
  isForbiddenRouteContext,
  isForbiddenRouteError,
  requireAuthenticatedRouteOrForbidden,
} from '@/modules/auth/presentation';
import { observeBeforeLoad } from '@/platform/router/route-observability';

export const Route = createFileRoute('/manager')({
  beforeLoad: ({ context, location }) =>
    observeBeforeLoad('/manager', () =>
      requireAuthenticatedRouteOrForbidden({
        context,
        location,
        permissionApps: ['manager'],
        requireFresh: true,
      })
    ),
  component: RouteComponent,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: ({ error }) =>
    isForbiddenRouteError(error) ? (
      <PageError type="403" />
    ) : (
      <RouteError error={error} routeId="/manager" />
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
