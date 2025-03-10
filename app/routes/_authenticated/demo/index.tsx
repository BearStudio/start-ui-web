import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/demo/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/demo/"!</div>;
}
