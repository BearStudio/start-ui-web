import * as Sentry from '@sentry/tanstackstart-react';

import { envClient } from '@/platform/env/client';
import {
  createNoOpTelemetry,
  type TelemetryAdapter,
} from '@/platform/telemetry';

import { createTelemetryAdapterChain } from './adapter-chain';
import { setTelemetry } from './index';
import { initOpenTelemetryClient } from './otel.client';
import {
  createSentryTelemetryAdapter,
  sanitizeSentryEvent,
} from './sentry-adapter';

let initialized = false;

// OpenTelemetry owns tracing; Sentry stays error-only even if
// VITE_SENTRY_TRACES_SAMPLE_RATE is present to avoid duplicate span reporting.
const SENTRY_ERROR_ONLY_TRACES_SAMPLE_RATE = 0;

/**
 * Initialize Sentry for the browser runtime. Safe to call multiple times.
 *
 * No-op when `VITE_SENTRY_DSN` is unset so previews/local dev keep working
 * without telemetry configuration.
 */
const isTelemetryAdapter = (
  adapter: TelemetryAdapter | undefined
): adapter is TelemetryAdapter => Boolean(adapter);

export const initTelemetryClient = (_router?: unknown) => {
  if (initialized) return;
  initialized = true;

  const adapters = [initOpenTelemetryClient()].filter(isTelemetryAdapter);

  if (!envClient.VITE_SENTRY_DSN) {
    if (adapters.length > 0) {
      setTelemetry(createTelemetryAdapterChain(adapters));
    }
    return;
  }

  Sentry.init({
    dsn: envClient.VITE_SENTRY_DSN,
    environment: envClient.VITE_SENTRY_ENVIRONMENT,
    tracesSampleRate: SENTRY_ERROR_ONLY_TRACES_SAMPLE_RATE,
    sendDefaultPii: false,
    tunnel: envClient.VITE_SENTRY_TUNNEL_PATH,
    beforeSend: sanitizeSentryEvent,
    integrations: [],
  });

  adapters.push(createSentryTelemetryAdapter(Sentry));
  setTelemetry(
    createTelemetryAdapterChain(
      adapters.length > 0 ? adapters : [createNoOpTelemetry()]
    )
  );
};
