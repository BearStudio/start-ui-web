import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageError } from '@/platform/components/errors/page-error';

import {
  LayoutLogin,
  normalizeInternalRedirect,
  resolvePostAuthDestination,
} from '@/modules/auth/presentation';

export const Route = createFileRoute('/login')({
  validateSearch: zodValidator(
    z
      .object({
        redirect: fallback(z.string(), '').optional(),
      })
      .passthrough()
  ),
  // Redirect already-authenticated users away from the login surface before
  // any layout shell paints. The destination mirrors useRedirectAfterLogin():
  // honor an explicit `redirect` search param, otherwise route by role.
  beforeLoad: async ({ context, search }) => {
    const session = await context.auth.getSession();
    if (!session) return;

    const explicitRedirect = normalizeInternalRedirect(search.redirect);
    if (explicitRedirect) {
      throw redirect({ href: explicitRedirect, replace: true });
    }

    throw redirect({
      to: resolvePostAuthDestination(session.user),
      replace: true,
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
