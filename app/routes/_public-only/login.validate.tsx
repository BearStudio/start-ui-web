import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import PageLoginValidate from '@/features/auth/page-login-validate';

export const Route = createFileRoute('/_public-only/login/validate')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      redirect: fallback(z.string().optional(), ''),
      token: z.string(),
      email: z.string().email(),
    })
  ),
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLoginValidate search={search} />;
}
