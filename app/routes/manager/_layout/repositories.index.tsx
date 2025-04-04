import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/manager/_layout/repositories/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/manager/repositories/"!</div>;
}
