import { createFileRoute } from '@tanstack/react-router';

import { RouteError } from '@/platform/components/errors/route-error';

import { LoginEmailHint } from '@/app/devtools/presentation';
import { PageLogin } from '@/modules/auth/presentation';

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
  errorComponent: ({ error }) => <RouteError error={error} routeId="/login/" />,
});

function RouteComponent() {
  const search = Route.useSearch();
  return <PageLogin emailHint={<LoginEmailHint />} search={search} />;
}
