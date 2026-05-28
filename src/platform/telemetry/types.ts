/**
 * Telemetry contract consumed by routes, server functions, and components.
 *
 * The router context carries one instance, constructed by the composition
 * layer (currently Sentry-backed). Domain code never imports a vendor SDK
 * directly — it goes through this interface so we can swap providers or run
 * tests against a no-op implementation.
 */

export type TelemetryUser = {
  id: string;
  email?: string | null;
  role?: string | null;
};

export type TelemetryTagValue = string | number | boolean;

export type TelemetryCaptureContext = {
  /** Short, low-cardinality labels (e.g. routeId). */
  tags?: Record<string, TelemetryTagValue>;
  /** High-cardinality structured data (e.g. inputs, ids). */
  extra?: Record<string, unknown>;
  fingerprint?: string[];
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
};

export type TelemetrySpanOptions = {
  name: string;
  op?: string;
  attributes?: Record<string, string | number | boolean | undefined>;
};

export interface TelemetryAdapter {
  /** Report an unexpected error. Safe to call from anywhere. */
  captureException(error: unknown, context?: TelemetryCaptureContext): void;
  /** Attach the current user to subsequent events. Pass `null` to clear. */
  setUser(user: TelemetryUser | null): void;
  /**
   * Run `fn` inside a tracing span. Always returns the inner value; if no
   * tracing backend is configured, this is a no-op wrapper.
   */
  startSpan<T>(options: TelemetrySpanOptions, fn: () => T): T;
}
