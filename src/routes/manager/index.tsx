import { createFileRoute, redirect } from '@tanstack/react-router';

import { isForbiddenRouteContext } from '@/modules/auth/presentation';
import { observeBeforeLoad } from '@/platform/router/route-observability';

export const Route = createFileRoute('/manager/')({
  component: RouteComponent,
  beforeLoad: ({ context }) =>
    observeBeforeLoad('/manager/', () => {
      if (isForbiddenRouteContext(context)) return;

      throw redirect({ to: '/manager/dashboard' });
    }),
});

function RouteComponent() {
  return null;
}
