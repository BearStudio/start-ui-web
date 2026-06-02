import { createFileRoute } from '@tanstack/react-router';

import { bookQueries } from '@/modules/book/client';
import { AppPageBooks as PageBooks } from '@/modules/book/presentation';
import { toScopeKey } from '@/modules/kernel';
import { observedLoader } from '@/platform/router/route-observability';

export const Route = createFileRoute('/app/books/')({
  loader: observedLoader('/app/books/', ({ context }) =>
    context.queryClient.ensureInfiniteQueryData(
      bookQueries.getAllInfinite({ scopeKey: toScopeKey(context.scopeKey) })
    )
  ),
  component: RouteComponent,
});

function RouteComponent() {
  return <PageBooks />;
}
