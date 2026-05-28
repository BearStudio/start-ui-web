import * as Sentry from '@sentry/tanstackstart-react';

import { getTelemetryConfig } from '@/modules/kernel/infrastructure/config/telemetry';

import { setTelemetry } from './index';
import {
  createSentryTelemetryAdapter,
  sanitizeSentryEvent,
} from './sentry-adapter';

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

  const telemetryConfig = getTelemetryConfig();
  if (!telemetryConfig.dsn) {
    return;
  }

  Sentry.init({
    dsn: telemetryConfig.dsn,
    environment: telemetryConfig.environment,
    tracesSampleRate: telemetryConfig.tracesSampleRate,
    sendDefaultPii: false,
    beforeSend: sanitizeSentryEvent,
  });

  setTelemetry(createSentryTelemetryAdapter(Sentry));
};
