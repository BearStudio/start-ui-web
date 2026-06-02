import { createFileRoute } from '@tanstack/react-router';

import { bookQueries } from '@/modules/book/client';
import { AppPageBook as PageBook } from '@/modules/book/presentation';
import { toBookId, toScopeKey } from '@/modules/kernel';
import { useShouldShowNav } from '@/app/shell/presentation';
import { observedLoader } from '@/platform/router/route-observability';

export const Route = createFileRoute('/app/books/$id/')({
  loader: observedLoader('/app/books/$id/', ({ context, params }) =>
    context.queryClient.ensureQueryData(
      bookQueries.getById({
        id: toBookId(params.id),
        scopeKey: toScopeKey(context.scopeKey),
      })
    )
  ),
  component: RouteComponent,
});

function RouteComponent() {
  useShouldShowNav('desktop-only');
  const params = Route.useParams();
  return <PageBook params={params} />;
}
