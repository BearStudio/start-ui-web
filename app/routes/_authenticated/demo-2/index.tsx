import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/demo-2/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div>Hello "/demo-2/"!</div>
      <Link to="/">Home</Link>
      <Link to="/demo">Demo</Link>
    </div>
  );
}
