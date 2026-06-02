import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/platform/components/errors/page-error';
import { RouteError } from '@/platform/components/errors/route-error';

import { AppLayout as Layout } from '@/app/shell/presentation';
import {
  isForbiddenRouteError,
  requireAuthenticatedRoute,
} from '@/modules/auth/presentation';
import { observeBeforeLoad } from '@/platform/router/route-observability';

export const Route = createFileRoute('/app')({
  beforeLoad: ({ context, location }) =>
    observeBeforeLoad('/app', () =>
      requireAuthenticatedRoute({
        context,
        location,
        permissionApps: ['app'],
      })
    ),
  component: RouteComponent,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: ({ error }) =>
    isForbiddenRouteError(error) ? <PageError type="403" /> : <RouteError />,
});

function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
