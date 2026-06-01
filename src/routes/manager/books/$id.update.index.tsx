import { createFileRoute } from '@tanstack/react-router';

import { openDemoModeDrawer } from '@/app/demo/presentation';
import { isForbiddenRouteContext } from '@/modules/auth/presentation';
import { bookQueries } from '@/modules/book/client';
import { PageBookUpdate } from '@/modules/book/presentation';
import { toBookId, toScopeKey } from '@/modules/kernel';

export const Route = createFileRoute('/manager/books/$id/update/')({
  loader: ({ context, params }) => {
    if (isForbiddenRouteContext(context)) return undefined;

    return context.queryClient.ensureQueryData(
      bookQueries.getById({
        id: toBookId(params.id),
        scopeKey: toScopeKey(context.scopeKey),
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return (
    <PageBookUpdate onDemoUploadBlocked={openDemoModeDrawer} params={params} />
  );
}
