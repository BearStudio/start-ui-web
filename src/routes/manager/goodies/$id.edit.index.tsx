import { createFileRoute } from '@tanstack/react-router';

import PageGoodieEdit from '@/features/goodies/page-goodies-edit';

export const Route = createFileRoute('/manager/goodies/$id/edit/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  return <PageGoodieEdit params={params} />;
}
