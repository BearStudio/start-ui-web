import { createFileRoute } from '@tanstack/react-router';

import { PageDashboard } from '@/modules/shell/presentation';

export const Route = createFileRoute('/manager/dashboard/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageDashboard />;
}
