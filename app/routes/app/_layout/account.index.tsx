import { createFileRoute } from '@tanstack/react-router';

import { PageAccount } from '@/features/account/app/page-account';

export const Route = createFileRoute('/app/_layout/account/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageAccount />;
}
