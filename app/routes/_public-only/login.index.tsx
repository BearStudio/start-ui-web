import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import PageLogin from '@/features/auth/page-login';

export const Route = createFileRoute('/_public-only/login/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      redirect: fallback(z.string(), '').optional(),
    })
  ),
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLogin search={search} />;
}
