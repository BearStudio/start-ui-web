import { createFileRoute } from '@tanstack/react-router';

import { ManagerPageAccount as PageAccount } from '@/modules/account/presentation';

export const Route = createFileRoute('/manager/account/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageAccount />;
}
