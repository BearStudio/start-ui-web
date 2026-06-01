import { createFileRoute } from '@tanstack/react-router';

import { isForbiddenRouteContext } from '@/modules/auth/presentation';
import { toScopeKey, toUserId } from '@/modules/kernel';
import { userQueries } from '@/modules/user/client';
import { PageUserUpdate } from '@/modules/user/presentation';

export const Route = createFileRoute('/manager/users/$id/update/')({
  loader: ({ context, params }) => {
    if (isForbiddenRouteContext(context)) return undefined;

    return context.queryClient.ensureQueryData(
      userQueries.getById({
        id: toUserId(params.id),
        scopeKey: toScopeKey(context.scopeKey),
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageUserUpdate params={params} />;
}
