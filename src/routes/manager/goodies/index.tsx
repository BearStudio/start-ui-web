import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/manager/goodies/')({
  component: RouteComponent,
  beforeLoad: () => {
    throw redirect({ to: '/manager/goodies/stock' });
  },
});

function RouteComponent() {
  return null;
}
