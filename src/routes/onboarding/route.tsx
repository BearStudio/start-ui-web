import { createFileRoute, Outlet } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageError } from '@/platform/components/errors/page-error';

import { requireOnboardingRoute } from '@/modules/auth/presentation';
import { observeBeforeLoad } from '@/platform/router/route-observability';

export const Route = createFileRoute('/onboarding')({
  validateSearch: zodValidator(
    z.object({
      redirect: fallback(z.string(), '').optional(),
    })
  ),
  beforeLoad: ({ context, location, search }) =>
    observeBeforeLoad('/onboarding', () =>
      requireOnboardingRoute({
        context,
        location,
        redirect: search.redirect,
      })
    ),
  component: Outlet,
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: () => <PageError type="error-boundary" />,
});
