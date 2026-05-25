import { createFileRoute } from '@tanstack/react-router';

import { userQueries } from '@/modules/user/client';
import { PageUser } from '@/modules/user/presentation';

export const Route = createFileRoute('/manager/users/$id/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      userQueries.getById({ ...params, scopeKey: context.scopeKey })
    ),
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageUser params={params} />;
}
