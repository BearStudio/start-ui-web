import { createFileRoute } from '@tanstack/react-router';

import { PageRepository } from '@/features/repository/manager/page-repository';

export const Route = createFileRoute('/manager/_layout/repositories/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageRepository params={params} />;
}
