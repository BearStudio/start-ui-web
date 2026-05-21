import { createFileRoute } from '@tanstack/react-router';

import { ManagerPageBook as PageBook } from '@/modules/book';

export const Route = createFileRoute('/manager/books/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageBook params={params} />;
}
