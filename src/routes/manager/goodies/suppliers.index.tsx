import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/manager/goodies/suppliers/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/manager/goodies/suppliers/"!</div>;
}
