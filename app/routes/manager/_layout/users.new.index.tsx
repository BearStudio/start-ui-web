import { createFileRoute } from '@tanstack/react-router';

import { PageUserNew } from '@/features/user/manager/page-user-new';

export const Route = createFileRoute('/manager/_layout/users/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageUserNew />;
}
