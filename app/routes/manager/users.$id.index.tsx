import { createFileRoute } from '@tanstack/react-router';

import { PageUser } from '@/features/user/manager/page-user';

export const Route = createFileRoute('/manager/users/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageUser params={params} />;
}
