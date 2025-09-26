import { createFileRoute } from '@tanstack/react-router';

import { PageHome } from '@/features/home/app/page-home';

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageHome />;
}
