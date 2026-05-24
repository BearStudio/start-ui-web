import * as Sentry from '@sentry/node';

import { envServer } from '@/platform/env/server';

import { setTelemetry } from './index';
import { createSentryTelemetryAdapter } from './sentry-adapter';

let initialized = false;

/**
 * Initialize Sentry for the Node server runtime. Safe to call multiple times;
 * the underlying SDK is only initialized once per process.
 *
 * No-op when `SENTRY_DSN` is unset so dev/test/CI without a DSN keep working.
 */
export const initTelemetryServer = () => {
  if (initialized) return;
  initialized = true;

  if (!envServer.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: envServer.SENTRY_DSN,
    environment: envServer.SENTRY_ENVIRONMENT,
    tracesSampleRate: envServer.SENTRY_TRACES_SAMPLE_RATE,
    sendDefaultPii: false,
  });

  setTelemetry(createSentryTelemetryAdapter(Sentry));
};
