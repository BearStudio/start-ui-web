import { createFileRoute } from '@tanstack/react-router';

import { bookQueries } from '@/modules/book/client';
import { ManagerPageBook as PageBook } from '@/modules/book/presentation';

export const Route = createFileRoute('/manager/books/$id/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      bookQueries.getById({ ...params, scopeKey: context.scopeKey })
    ),
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageBook params={params} />;
}
