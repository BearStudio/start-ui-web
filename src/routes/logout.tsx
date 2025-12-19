import { createFileRoute } from '@tanstack/react-router';

import { PageLogout } from '@/features/auth/page-logout';

export const Route = createFileRoute('/logout')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageLogout />;
}
