import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/demo/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div>Hello "/demo/"!</div>
      <Link to="/public">Public page</Link>
      <Link to="/demo-2">Demo 2</Link>
    </div>
  );
}
