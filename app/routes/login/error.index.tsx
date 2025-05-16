import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import PageLoginError from '@/features/auth/page-login-error';

export const Route = createFileRoute('/login/error/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      error: fallback(z.string(), '').optional(),
    })
  ),
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLoginError search={search} />;
}
