import * as Sentry from '@sentry/tanstackstart-react';

import { getTelemetryConfig } from '@/modules/kernel/infrastructure/config/telemetry';
import {
  createNoOpTelemetry,
  type TelemetryAdapter,
} from '@/platform/telemetry';

import { setTelemetry } from './index';
import { createTelemetryAdapterChain } from './adapter-chain';
import { initOpenTelemetryServer } from './otel.server';
import {
  createSentryTelemetryAdapter,
  sanitizeSentryEvent,
} from './sentry-adapter';

let initialized = false;

const isTelemetryAdapter = (
  adapter: TelemetryAdapter | undefined
): adapter is TelemetryAdapter => Boolean(adapter);

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
  const adapters = [initOpenTelemetryServer()].filter(isTelemetryAdapter);
  if (!telemetryConfig.dsn) {
    if (adapters.length > 0) {
      setTelemetry(createTelemetryAdapterChain(adapters));
    }
    return;
  }

  Sentry.init({
    dsn: telemetryConfig.dsn,
    environment: telemetryConfig.environment,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: sanitizeSentryEvent,
  });

  adapters.push(createSentryTelemetryAdapter(Sentry));
  setTelemetry(
    createTelemetryAdapterChain(
      adapters.length > 0 ? adapters : [createNoOpTelemetry()]
    )
  );
};
