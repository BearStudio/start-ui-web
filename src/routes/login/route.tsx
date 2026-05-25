import { createFileRoute, Outlet } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageError } from '@/platform/components/errors/page-error';

import {
  LayoutLogin,
  redirectAuthenticatedRoute,
} from '@/modules/auth/presentation';

export const Route = createFileRoute('/login')({
  validateSearch: zodValidator(
    z
      .object({
        redirect: fallback(z.string(), '').optional(),
      })
      .passthrough()
  ),
  beforeLoad: async ({ context, search }) => {
    return redirectAuthenticatedRoute({
      context,
      redirect: search.redirect,
    });
  },
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
