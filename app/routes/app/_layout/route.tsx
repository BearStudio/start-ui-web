import { createFileRoute, Outlet } from '@tanstack/react-router';

import { PageError } from '@/components/page-error';

import { Layout } from '@/layout/app/layout';

export const Route = createFileRoute('/app/_layout')({
  component: RouteComponent,
  notFoundComponent: () => <PageError error="404" />,
  errorComponent: () => <PageError error="500" />,
});

function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
