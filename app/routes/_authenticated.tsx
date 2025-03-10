import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
});

function RouteComponent() {
  const checkAuth = useQuery(orpc.auth.checkAuthenticated.queryOptions());
  const router = useRouter();

  if (checkAuth.isLoading) {
    return <div>Loading...</div>;
  }

  if (checkAuth.isError) {
    return <div>Something wrong happened</div>;
  }

  if (!checkAuth.data?.isAuthenticated) {
    router.navigate({
      to: '/',
      replace: true,
      search: {
        // Use the current location to power a redirect after login
        // (Do not use `router.state.resolvedLocation` as it can
        // potentially lag behind the actual current location)
        redirect: location.href,
      },
    });
    return;
  }

  return (
    <div>
      Auth layout <Outlet />
    </div>
  );
}
