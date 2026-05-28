import { createRouter } from '@tanstack/react-router';
import { createClientOnlyFn, createServerOnlyFn } from '@tanstack/react-start';

import { createClientQueryClient } from '@/composition/client-query';
import { telemetryProxy } from '@/composition/telemetry';
import { authQueries } from '@/modules/auth/client';
import { isDevEnvironment } from '@/platform/env/config';
import { createNoOpFlags } from '@/platform/flags';
import type { RouterContext } from '@/platform/router/context';

import { routeTree } from './routeTree.gen';

const initTelemetryServerOnly = createServerOnlyFn(async () => {
  const { initTelemetryServer } =
    await import('@/composition/telemetry/sentry.server');

  initTelemetryServer();
});

const initTelemetryClientOnly = createClientOnlyFn(async (router: unknown) => {
  const { initTelemetryClient } =
    await import('@/composition/telemetry/sentry.client');

  initTelemetryClient(router);
});

// Eagerly initialize the right Sentry runtime via dynamic import so the
// wrong-side SDK is not bundled into each environment. Failure is non-fatal
// (DSN may not be configured); the telemetry proxy falls back to a no-op
// adapter so all call sites remain unconditional.
if (import.meta.env.SSR) {
  void initTelemetryServerOnly().catch((error: unknown) => {
    if (isDevEnvironment()) {
      console.warn('Telemetry init failed (non-fatal):', error);
    }
  });
} else {
  // Client telemetry needs the concrete router instance for Start router
  // tracing, so it is initialized inside getRouter().
}

const flags = createNoOpFlags();

export function getRouter() {
  const queryClient = createClientQueryClient();
  const routerContext: RouterContext = {
    queryClient,
    // Cached per router/query client so concurrent route guards within a
    // navigation share the sanitized current-session fetch without sharing
    // cache state across SSR requests or router instances.
    auth: {
      getSession: () => queryClient.fetchQuery(authQueries.currentSession()),
    },
    telemetry: telemetryProxy,
    flags,
  };

  const router = createRouter({
    context: routerContext,
    defaultPreload: 'intent',
    // Since we're using React Query, we don't want loader calls to ever be stale
    // This will ensure that the loader is always called when the route is preloaded or visited
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    routeTree,
  });

  if (!import.meta.env.SSR) {
    void initTelemetryClientOnly(router).catch((error: unknown) => {
      if (isDevEnvironment()) {
        console.warn('Telemetry init failed (non-fatal):', error);
      }
    });
  }

  return router;
}
