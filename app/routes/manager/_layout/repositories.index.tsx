import { createFileRoute } from '@tanstack/react-router';

import { PageRepositories } from '@/features/repository/manager/page-repositories';

export const Route = createFileRoute('/manager/_layout/repositories/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageRepositories />;
}
