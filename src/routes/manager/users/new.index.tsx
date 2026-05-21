import { createFileRoute } from '@tanstack/react-router';

import { PageUserNew } from '@/modules/user/presentation';

export const Route = createFileRoute('/manager/users/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageUserNew />;
}
