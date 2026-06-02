import { sanitizeLogFields } from '@/platform/lib/redaction/sanitize-log-fields';

import {
  type TelemetryAdapter,
  toTelemetryStringTags,
} from '@/platform/telemetry';

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
      fingerprint?: string[];
      level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
    }
  ) => string;
  setUser: (
    user: { id: string; email?: string; segment?: string } | null
  ) => void;
  setTag?: (key: string, value: string) => void;
  startSpan?: <T>(
    options: {
      name: string;
      op?: string;
      attributes?: Record<string, string | number | boolean | undefined>;
    },
    fn: () => T
  ) => T;
};

type SentryEventLike = {
  contexts?: Record<string, unknown>;
  extra?: Record<string, unknown>;
  tags?: Record<string, unknown>;
};

const toStringTags = (tags: unknown): Record<string, string> | undefined => {
  if (!tags || typeof tags !== 'object' || Array.isArray(tags)) {
    return undefined;
  }

  return toTelemetryStringTags(tags as Record<string, unknown>, {
    allowEmpty: true,
  });
};

export const sanitizeSentryEvent = <TEvent extends SentryEventLike>(
  event: TEvent
): TEvent => {
  const sanitized = sanitizeLogFields({
    contexts: event.contexts ?? {},
    extra: event.extra ?? {},
    tags: event.tags ?? {},
  });

  return {
    ...event,
    contexts: sanitized.contexts as Record<string, unknown>,
    extra: sanitized.extra as Record<string, unknown>,
    tags: toStringTags(sanitized.tags),
  };
};

export const createSentryTelemetryAdapter = (
  Sentry: SentryLike
): TelemetryAdapter => ({
  captureException: (error, context) => {
    Sentry.captureException(error, {
      tags: toStringTags(context?.tags),
      extra: context?.extra,
      fingerprint: context?.fingerprint,
      level: context?.level,
    });
  },
  setUser: (user) => {
    if (!user) {
      Sentry.setUser(null);
      Sentry.setTag?.('role', 'none');
      return;
    }
    Sentry.setUser({
      id: user.id,
      segment: user.role ?? undefined,
    });
    Sentry.setTag?.('role', user.role ?? 'none');
  },
  currentCorrelation: () => ({}),
  emitLog: () => {},
  recordMetric: () => {},
  startManualSpan: () => ({
    addEvent: () => {},
    end: () => {},
    recordException: () => {},
    setAttributes: () => {},
    setStatus: () => {},
  }),
  startSpan: (_options, fn) => fn(),
});
