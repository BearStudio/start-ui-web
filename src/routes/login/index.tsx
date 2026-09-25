import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageError } from '@/components/errors/page-error';

import PageLogin from '@/features/auth/page-login';
import {
  isSafeRedirectPath,
  normalizeRedirectParam,
} from '@/features/auth/utils';

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      redirect: fallback(
        z
          .string()
          .refine(
            (v) => !v.includes('://'),
            'External redirect URLs are not allowed'
          )
          .transform(normalizeRedirectParam)
          .refine(isSafeRedirectPath),
        '/'
      ).optional(),
    })
  ),
  errorComponent: () => <PageError type="error-boundary" />,
});

/** Renders the login page, passing validated search params to PageLogin. */
function RouteComponent() {
  const search = Route.useSearch();
  return <PageLogin search={search} />;
}
