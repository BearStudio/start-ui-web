import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { PageError } from '@/platform/components/errors/page-error';

import {
  internalRedirectFromLocation,
  resolvePostAuthDestination,
} from '@/modules/auth/presentation';

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async ({ context, location }) => {
    const session = await context.auth.getSession();

    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: internalRedirectFromLocation(location) },
        replace: true,
      });
    }

    // Already onboarded: there's nothing to do here.
    if (session.user.onboardedAt) {
      throw redirect({
        to: resolvePostAuthDestination(session.user),
        replace: true,
      });
    }

    return { session };
  },
  component: Outlet,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: () => <PageError type="error-boundary" />,
});
