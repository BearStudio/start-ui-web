import { createFileRoute } from '@tanstack/react-router';

import { PageError } from '@/components/errors/page-error';

import { PageLogout } from '@/modules/auth/presentation';

export const Route = createFileRoute('/logout')({
  component: RouteComponent,
  errorComponent: () => <PageError type="error-boundary" />,
});

function RouteComponent() {
  return <PageLogout />;
}
