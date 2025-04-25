import { createFileRoute } from '@tanstack/react-router';

import { PageUpdateUser } from '@/features/user/manager/page-update-user';

export const Route = createFileRoute('/manager/_layout/users/$id/update/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageUpdateUser params={params} />;
}
