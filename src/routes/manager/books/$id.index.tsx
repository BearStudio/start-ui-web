import { createFileRoute } from '@tanstack/react-router';

import { isForbiddenRouteContext } from '@/modules/auth/presentation';
import { bookQueries } from '@/modules/book/client';
import { ManagerPageBook as PageBook } from '@/modules/book/presentation';
import { toBookId, toScopeKey } from '@/modules/kernel';
import { observedLoader } from '@/platform/router/route-observability';

export const Route = createFileRoute('/manager/books/$id/')({
  loader: observedLoader('/manager/books/$id/', ({ context, params }) => {
    if (isForbiddenRouteContext(context)) return undefined;

    return context.queryClient.ensureQueryData(
      bookQueries.getById({
        id: toBookId(params.id),
        scopeKey: toScopeKey(context.scopeKey),
      })
    );
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageBook params={params} />;
}
