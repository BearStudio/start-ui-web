import { createFileRoute } from '@tanstack/react-router';

import { PageError } from '@/components/errors/page-error';

import { PageLogout } from '@/features/auth/page-logout';

export const Route = createFileRoute('/logout')({
  component: RouteComponent,
  errorComponent: () => <PageError type="error-boundary" />,
});

function RouteComponent() {
  return <PageLogout />;
}
