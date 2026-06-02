import { createFileRoute, Outlet } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageError } from '@/platform/components/errors/page-error';

import {
  LayoutLogin,
  redirectAuthenticatedRoute,
} from '@/modules/auth/presentation';
import { observeBeforeLoad } from '@/platform/router/route-observability';

export const Route = createFileRoute('/login')({
  validateSearch: zodValidator(
    z
      .object({
        redirect: fallback(z.string(), '').optional(),
      })
      .passthrough()
  ),
  beforeLoad: ({ context, search }) =>
    observeBeforeLoad('/login', () =>
      redirectAuthenticatedRoute({
        context,
        redirect: search.redirect,
      })
    ),
  component: RouteComponent,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: () => <PageError type="error-boundary" />,
});

function RouteComponent() {
  return (
    <LayoutLogin>
      <Outlet />
    </LayoutLogin>
  );
}
