import { createFileRoute } from '@tanstack/react-router';

import { PageError } from '@/components/errors/page-error';

import { PageLogin } from '@/modules/auth/presentation';

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
  errorComponent: () => <PageError type="error-boundary" />,
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLogin search={search} />;
}
