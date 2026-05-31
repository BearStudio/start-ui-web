import { createFileRoute, redirect } from '@tanstack/react-router';

import { isForbiddenRouteContext } from '@/modules/auth/presentation';

export const Route = createFileRoute('/manager/')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (isForbiddenRouteContext(context)) return;

    throw redirect({ to: '/manager/dashboard' });
  },
});

function RouteComponent() {
  return null;
}
