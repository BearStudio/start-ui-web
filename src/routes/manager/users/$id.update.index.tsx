import { createFileRoute } from '@tanstack/react-router';

import { PageUserUpdate } from '@/features/user/manager/page-user-update';

export const Route = createFileRoute('/manager/users/$id/update/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageUserUpdate params={params} />;
}
