import { createFileRoute } from '@tanstack/react-router';

import PageLogin from '@/features/auth/page-login';

export const Route = createFileRoute('/_public-only/login/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageLogin />;
}
