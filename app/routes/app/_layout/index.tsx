import { createFileRoute } from '@tanstack/react-router';

import { PageHome } from '@/features/home/app/page-home';

export const Route = createFileRoute('/app/_layout/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageHome />;
}
