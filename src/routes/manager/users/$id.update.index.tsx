import { createFileRoute } from '@tanstack/react-router';

import { PageUserUpdate } from '@/modules/user';

export const Route = createFileRoute('/manager/users/$id/update/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageUserUpdate params={params} />;
}
