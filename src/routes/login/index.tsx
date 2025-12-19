import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageError } from '@/components/errors/page-error';

import PageLogin from '@/features/auth/page-login';

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      redirect: fallback(z.string(), '').optional(),
    })
  ),
  errorComponent: () => <PageError type="error-boundary" />,
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLogin search={search} />;
}
