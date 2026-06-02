import type { TelemetryAdapter } from './types';

/**
 * No-op telemetry adapter used when no DSN is configured and in tests. Keeps
 * call sites unconditional so route loaders and server functions never need to
 * null-check the telemetry slot.
 */
export const createNoOpTelemetry = (): TelemetryAdapter => ({
  captureException: () => {},
  setUser: () => {},
  startSpan: (_options, fn) => fn(),
  startManualSpan: () => ({
    addEvent: () => {},
    end: () => {},
    recordException: () => {},
    setAttributes: () => {},
    setStatus: () => {},
  }),
  currentCorrelation: () => ({}),
  emitLog: () => {},
  recordMetric: () => {},
});
