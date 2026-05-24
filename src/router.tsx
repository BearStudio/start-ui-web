import { createRouter } from '@tanstack/react-router';

import { queryClient } from '@/composition/client-query';
import { fetchSession } from '@/composition/session';
import { telemetryProxy } from '@/composition/telemetry';
import { createNoOpFlags } from '@/platform/flags';
import type { RouterContext } from '@/platform/router/context';

import { routeTree } from './routeTree.gen';

// Eagerly initialize the right Sentry runtime via dynamic import so the
// wrong-side SDK is not bundled into each environment. Failure is non-fatal
// (DSN may not be configured); the telemetry proxy falls back to a no-op
// adapter so all call sites remain unconditional.
if (import.meta.env.SSR) {
  import('@/composition/telemetry/sentry.server')
    .then(({ initTelemetryServer }) => initTelemetryServer())
    .catch(() => {});
} else {
  import('@/composition/telemetry/sentry.client')
    .then(({ initTelemetryClient }) => initTelemetryClient())
    .catch(() => {});
}

const flags = createNoOpFlags();

const routerContext: RouterContext = {
  queryClient,
  // Cached per navigation via the shared query cache so multiple route
  // beforeLoad calls in a single navigation share a single session fetch.
  auth: {
    getSession: () =>
      queryClient.ensureQueryData({
        queryKey: ['session'],
        queryFn: () => fetchSession(),
        staleTime: 0,
      }),
  },
  telemetry: telemetryProxy,
  flags,
  tenant: null,
};

export function getRouter() {
  return createRouter({
    context: routerContext,
    defaultPreload: 'intent',
    // Since we're using React Query, we don't want loader calls to ever be stale
    // This will ensure that the loader is always called when the route is preloaded or visited
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    routeTree,
  });
}
