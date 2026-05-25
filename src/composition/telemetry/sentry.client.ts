import * as Sentry from '@sentry/react';

import { envClient } from '@/platform/env/client';

import { setTelemetry } from './index';
import { createSentryTelemetryAdapter } from './sentry-adapter';

let initialized = false;

/**
 * Initialize Sentry for the browser runtime. Safe to call multiple times.
 *
 * No-op when `VITE_SENTRY_DSN` is unset so previews/local dev keep working
 * without telemetry configuration.
 */
export const initTelemetryClient = () => {
  if (initialized) return;
  initialized = true;

  if (!envClient.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: envClient.VITE_SENTRY_DSN,
    environment: envClient.VITE_SENTRY_ENVIRONMENT,
    tracesSampleRate: envClient.VITE_SENTRY_TRACES_SAMPLE_RATE,
    integrations: [Sentry.browserTracingIntegration()],
  });

  setTelemetry(createSentryTelemetryAdapter(Sentry));
};
