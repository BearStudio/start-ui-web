import { createFileRoute } from '@tanstack/react-router';

import { PageBookUpdate } from '@/modules/book/presentation';

export const Route = createFileRoute('/manager/books/$id/update/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageBookUpdate params={params} />;
}
