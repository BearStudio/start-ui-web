import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import PageLoginError from '@/features/auth/page-login-error';

export const Route = createFileRoute('/login/error/')({
  component: RouteComponent,
  validateSearch: z.object({
    error: z.string().catch('').optional(),
  }),
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLoginError search={search} />;
}
