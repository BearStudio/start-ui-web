import type { TelemetryAdapter } from '@/platform/telemetry';

/**
 * Minimum shape both `@sentry/node` and `@sentry/react` expose. Captured here
 * so the adapter does not depend on either SDK directly — runtime entries
 * (`sentry.server.ts`, `sentry.client.ts`) construct the adapter and inject
 * the active SDK.
 */
export type SentryLike = {
  captureException: (
    error: unknown,
    context?: {
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
    }
  ) => string;
  setUser: (
    user: { id: string; email?: string; segment?: string } | null
  ) => void;
  setTag?: (key: string, value: string) => void;
  startSpan: <T>(
    options: {
      name: string;
      op?: string;
      attributes?: Record<string, string | number | boolean | undefined>;
    },
    fn: () => T
  ) => T;
};

export const createSentryTelemetryAdapter = (
  Sentry: SentryLike
): TelemetryAdapter => ({
  captureException: (error, context) => {
    Sentry.captureException(error, {
      tags: context?.tags,
      extra: context?.extra,
    });
  },
  setUser: (user) => {
    if (!user) {
      Sentry.setUser(null);
      Sentry.setTag?.('role', 'none');
      Sentry.setTag?.('tenantId', 'none');
      return;
    }
    Sentry.setUser({
      id: user.id,
      email: user.email ?? undefined,
      segment: user.role ?? undefined,
    });
    Sentry.setTag?.('role', user.role ?? 'none');
    Sentry.setTag?.('tenantId', user.tenantId ?? 'none');
  },
  startSpan: (options, fn) =>
    Sentry.startSpan(
      { name: options.name, op: options.op, attributes: options.attributes },
      fn
    ),
});
