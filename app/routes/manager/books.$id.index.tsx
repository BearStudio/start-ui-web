import { createFileRoute } from '@tanstack/react-router';

import { PageBook } from '@/features/book/manager/page-book';

export const Route = createFileRoute('/manager/books/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageBook params={params} />;
}
