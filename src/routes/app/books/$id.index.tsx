import { createFileRoute } from '@tanstack/react-router';

import { PageBook } from '@/features/book/app/page-book';
import { useShouldShowNav } from '@/layout/app/layout';

export const Route = createFileRoute('/app/books/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  useShouldShowNav('desktop-only');
  const params = Route.useParams();
  return <PageBook params={params} />;
}
