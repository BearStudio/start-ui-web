import { createFileRoute, redirect } from '@tanstack/react-router';

import { observedBeforeLoad } from '@/platform/router/route-observability';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: observedBeforeLoad('/', () => {
    throw redirect({ to: '/login' });
  }),
});

function RouteComponent() {
  return null;
}
