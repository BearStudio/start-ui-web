import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/manager/goodies/stock/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/manager/goodies/"!</div>;
}
