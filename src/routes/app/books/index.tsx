import { createFileRoute } from '@tanstack/react-router';

import { bookQueries } from '@/modules/book/client';
import { AppPageBooks as PageBooks } from '@/modules/book/presentation';

export const Route = createFileRoute('/app/books/')({
  loader: ({ context }) =>
    context.queryClient.ensureInfiniteQueryData(
      bookQueries.getAllInfinite({ scopeKey: context.scopeKey })
    ),
  component: RouteComponent,
});

function RouteComponent() {
  return <PageBooks />;
}
