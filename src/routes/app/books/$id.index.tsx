import { createFileRoute } from '@tanstack/react-router';

import { bookQueries } from '@/modules/book/client';
import { AppPageBook as PageBook } from '@/modules/book/presentation';
import { useShouldShowNav } from '@/app/shell/presentation';

export const Route = createFileRoute('/app/books/$id/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      bookQueries.getById({ ...params, scopeKey: context.scopeKey })
    ),
  component: RouteComponent,
});

function RouteComponent() {
  useShouldShowNav('desktop-only');
  const params = Route.useParams();
  return <PageBook params={params} />;
}
