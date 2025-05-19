import { createFileRoute } from '@tanstack/react-router';

import { PageBook } from '@/features/book/app/page-book';

export const Route = createFileRoute('/app/_layout-desktop-only/books/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageBook params={params} />;
}
