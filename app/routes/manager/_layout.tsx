import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Layout } from '@/layout/manager/layout';

export const Route = createFileRoute('/manager/_layout')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
