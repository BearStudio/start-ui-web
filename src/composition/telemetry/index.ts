import type { TelemetryAdapter } from '@/platform/telemetry';
import { createNoOpTelemetry } from '@/platform/telemetry';

/**
 * Active telemetry instance for the running process/tab. Default is a no-op
 * so calls are safe before the runtime entry has initialized Sentry; the
 * runtime swaps in the real adapter via `setTelemetry`.
 */
let activeAdapter: TelemetryAdapter = createNoOpTelemetry();

export const setTelemetry = (adapter: TelemetryAdapter) => {
  activeAdapter = adapter;
};

export const getTelemetry = (): TelemetryAdapter => activeAdapter;

/**
 * Stable proxy suitable for the router context. Reads the active adapter on
 * each call so dynamic Sentry init in `router.tsx` takes effect immediately.
 */
export const telemetryProxy: TelemetryAdapter = {
  captureException: (error, context) =>
    activeAdapter.captureException(error, context),
  setUser: (user) => activeAdapter.setUser(user),
  startSpan: (options, fn) => activeAdapter.startSpan(options, fn),
};
