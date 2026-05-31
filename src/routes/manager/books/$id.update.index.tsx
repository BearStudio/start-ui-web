import { createFileRoute } from '@tanstack/react-router';

import { isForbiddenRouteContext } from '@/modules/auth/presentation';
import { bookQueries } from '@/modules/book/client';
import { PageBookUpdate } from '@/modules/book/presentation';

export const Route = createFileRoute('/manager/books/$id/update/')({
  loader: ({ context, params }) => {
    if (isForbiddenRouteContext(context)) return undefined;

    return context.queryClient.ensureQueryData(
      bookQueries.getById({ ...params, scopeKey: context.scopeKey })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageBookUpdate params={params} />;
}
