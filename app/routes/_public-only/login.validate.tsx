import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_public-only/login/validate')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="p-8">...</div>;
}
