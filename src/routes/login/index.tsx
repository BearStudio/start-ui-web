import { createFileRoute } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { PageErrorBoundary } from '@/components/page-error-boundary';

import PageLogin from '@/features/auth/page-login';

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      redirect: fallback(z.string(), '').optional(),
    })
  ),
  errorComponent: (props) => {
    return <PageErrorBoundary {...props} />;
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLogin search={search} />;
}
