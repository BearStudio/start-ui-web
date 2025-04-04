import { createFileRoute } from '@tanstack/react-router';

import { PageRepositories } from '@/features/repository/app/page-repositories';

export const Route = createFileRoute('/app/_layout/repositories/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageRepositories />;
}
