import { createFileRoute } from '@tanstack/react-router';

import { PageUsers } from '@/features/user/manager/page-users';

export const Route = createFileRoute('/manager/_layout/users/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageUsers />;
}
