import { createFileRoute } from '@tanstack/react-router';

import { PageRepository } from '@/features/repository/app/page-repository';

export const Route = createFileRoute(
  '/app/_layout-desktop-only/repositories/$id/'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PageRepository params={params} />;
}
