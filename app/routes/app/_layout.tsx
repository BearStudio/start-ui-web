import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Layout } from '@/layout/app/layout';

export const Route = createFileRoute('/app/_layout')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
