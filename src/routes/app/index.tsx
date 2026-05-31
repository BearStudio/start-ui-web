import { createFileRoute } from '@tanstack/react-router';

import { PageHome } from '@/app/shell/presentation';

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageHome />;
}
