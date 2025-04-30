import { createFileRoute } from '@tanstack/react-router';

import { PageAccount } from '@/features/account/manager/page-account';

export const Route = createFileRoute('/manager/_layout/account/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageAccount />;
}
