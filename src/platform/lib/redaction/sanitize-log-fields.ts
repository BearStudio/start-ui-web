type SanitizeLogFieldsOptions = {
  sensitiveKeys: ReadonlySet<string>;
};

const CIRCULAR_VALUE = '[Circular]';
const NON_PLAIN_OBJECT_VALUE = '[NonPlainObject]';
const REDACTED_VALUE = '[REDACTED]';
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

const redactString = (value: string) =>
  value.replace(EMAIL_PATTERN, REDACTED_VALUE);

const isSensitiveKey = (key: string, sensitiveKeys: ReadonlySet<string>) =>
  sensitiveKeys.has(key.toLowerCase());

const isPlainObject = (value: object) => {
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
};

const sanitizeLogValue = (
  key: string,
  value: unknown,
  { sensitiveKeys }: SanitizeLogFieldsOptions,
  path: WeakSet<object>
): unknown => {
  if (isSensitiveKey(key, sensitiveKeys)) {
    return REDACTED_VALUE;
  }

  if (typeof value === 'string') {
    return redactString(value);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (path.has(value)) {
    return CIRCULAR_VALUE;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof RegExp) {
    return value.toString();
  }

  if (ArrayBuffer.isView(value)) {
    return value;
  }

  if (!Array.isArray(value) && !isPlainObject(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return NON_PLAIN_OBJECT_VALUE;
    }
  }

  path.add(value);
  try {
    if (Array.isArray(value)) {
      return Array.from(value, (item) =>
        sanitizeLogValue('', item, { sensitiveKeys }, path)
      );
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(
        ([entryKey, entryValue]) => [
          entryKey,
          sanitizeLogValue(entryKey, entryValue, { sensitiveKeys }, path),
        ]
      )
    );
  } finally {
    path.delete(value);
  }
};

export const sanitizeLogFields = (
  fields: Record<string, unknown>,
  options: SanitizeLogFieldsOptions
): Record<string, unknown> => {
  const path = new WeakSet<object>();
  path.add(fields);

  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      sanitizeLogValue(key, value, options, path),
    ])
  );
};
