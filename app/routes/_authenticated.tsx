import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router';

import { orpc } from '@/lib/orpc/client';
import { Outputs } from '@/lib/orpc/types';

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const checkAuth = useQuery(
    orpc.auth.checkAuthenticated.queryOptions({
      gcTime: 0, // Prevent cache issue
    })
  );
  const router = useRouter();

  if (checkAuth.isLoading) {
    return <div>Loading...</div>;
  }

  if (checkAuth.isError) {
    return <div>Something wrong happened</div>;
  }

  if (!checkAuth.data?.isAuthenticated) {
    queryClient.setQueryData<Outputs['auth']['checkAuthenticated']>(
      orpc.auth.checkAuthenticated.key({ type: 'query' }),
      {
        isAuthenticated: false,
      }
    );
    router.navigate({
      to: '/',
      replace: true,
      search: {
        redirect: location.href,
      },
    });
    return null;
  }

  return (
    <div>
      Auth layout <Outlet />
    </div>
  );
}
