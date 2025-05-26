import { createRouter as createTanStackRouter } from '@tanstack/react-router';

import { queryClient } from '@/lib/tanstack-query/query-client';

import { routeTree } from './routeTree.gen';

export function createRouter() {
  return createTanStackRouter({
    context: {
      queryClient,
    },
    defaultPreload: 'intent',
    // Since we're using React Query, we don't want loader calls to ever be stale
    // This will ensure that the loader is always called when the route is preloaded or visited
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    routeTree,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
