import { envClient } from '@/platform/env/client';

type AuthE2eDebugFields = Record<string, unknown>;

const SENSITIVE_FIELD_NAMES = new Set([
  'email',
  'id',
  'identifier',
  'name',
  'phone',
  'user',
]);
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

const redactString = (value: string) =>
  value.replace(EMAIL_PATTERN, '[REDACTED]');

const sanitizeDebugValue = (
  key: string,
  value: unknown,
  seen: WeakSet<object>
): unknown => {
  if (SENSITIVE_FIELD_NAMES.has(key.toLowerCase())) {
    return '[REDACTED]';
  }

  if (typeof value === 'string') {
    return redactString(value);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDebugValue('', item, seen));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(
      ([entryKey, entryValue]) => [
        entryKey,
        sanitizeDebugValue(entryKey, entryValue, seen),
      ]
    )
  );
};

const sanitizeDebugFields = (
  fields: AuthE2eDebugFields
): AuthE2eDebugFields => {
  const seen = new WeakSet<object>();
  seen.add(fields);
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      sanitizeDebugValue(key, value, seen),
    ])
  );
};

export const authE2eDebug = (
  event: string,
  fields: AuthE2eDebugFields = {}
) => {
  if (envClient.VITE_ENV_NAME !== 'tests') {
    return;
  }

  try {
    console.info(
      `[auth-e2e] ${event}`,
      JSON.stringify({
        at: new Date().toISOString(),
        event,
        ...sanitizeDebugFields(fields),
      })
    );
  } catch (error) {
    console.warn('[auth-e2e] Failed to serialize debug fields', error);
  }
};
