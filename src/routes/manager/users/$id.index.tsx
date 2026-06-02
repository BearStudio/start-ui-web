import { createFileRoute } from '@tanstack/react-router';

import { isForbiddenRouteContext } from '@/modules/auth/presentation';
import { toScopeKey, toUserId } from '@/modules/kernel';
import { userQueries } from '@/modules/user/client';
import { PageUser } from '@/modules/user/presentation';
import { observedLoader } from '@/platform/router/route-observability';

export const Route = createFileRoute('/manager/users/$id/')({
  loader: observedLoader('/manager/users/$id/', ({ context, params }) => {
    if (isForbiddenRouteContext(context)) return undefined;

    return context.queryClient.ensureQueryData(
      userQueries.getById({
        id: toUserId(params.id),
        scopeKey: toScopeKey(context.scopeKey),
      })
    );
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageUser params={params} />;
}
