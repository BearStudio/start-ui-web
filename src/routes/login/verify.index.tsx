import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import PageLoginVerify from '@/features/auth/page-login-verify';

export const Route = createFileRoute('/login/verify/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      redirect: fallback(z.string(), '').optional(),
      email: z.email(),
    })
  ),
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLoginVerify search={search} />;
}
