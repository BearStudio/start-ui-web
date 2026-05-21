import { createFileRoute } from '@tanstack/react-router';

import { AppPageAccount as PageAccount } from '@/modules/account/presentation';

export const Route = createFileRoute('/app/account/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageAccount />;
}
