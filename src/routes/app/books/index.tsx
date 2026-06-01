import { createFileRoute } from '@tanstack/react-router';

import { bookQueries } from '@/modules/book/client';
import { AppPageBooks as PageBooks } from '@/modules/book/presentation';
import { toScopeKey } from '@/modules/kernel';

export const Route = createFileRoute('/app/books/')({
  loader: ({ context }) =>
    context.queryClient.ensureInfiniteQueryData(
      bookQueries.getAllInfinite({ scopeKey: toScopeKey(context.scopeKey) })
    ),
  component: RouteComponent,
});

function RouteComponent() {
  return <PageBooks />;
}
