import { createFileRoute } from '@tanstack/react-router';

import { PageNewUser } from '@/features/user/manager/page-new-user';

export const Route = createFileRoute('/manager/_layout/users/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageNewUser />;
}
