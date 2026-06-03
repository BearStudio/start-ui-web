import type { QueryClient } from '@tanstack/react-query';

export type QueryErrorResetClient = Pick<QueryClient, 'resetQueries'>;

type RouteRetryRouter = {
  invalidate: () => Promise<unknown> | unknown;
};

export async function retryRouteError({
  queryClient,
  router,
}: {
  queryClient?: QueryErrorResetClient;
  router: RouteRetryRouter;
}) {
  await queryClient?.resetQueries({
    predicate: (query) => query.state.status === 'error',
  });
  await router.invalidate();
}
