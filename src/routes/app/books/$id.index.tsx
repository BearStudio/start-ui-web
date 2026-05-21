import { createFileRoute } from '@tanstack/react-router';

import { useShouldShowNav } from '@/layout/app/layout';
import { AppPageBook as PageBook } from '@/modules/book';

export const Route = createFileRoute('/app/books/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  useShouldShowNav('desktop-only');
  const params = Route.useParams();
  return <PageBook params={params} />;
}
