import { mapValues, pullObject } from 'remeda';

type SanitizeLogFieldsOptions = {
  sensitiveKeys?: ReadonlySet<string>;
};

type NormalizedSanitizeLogFieldsOptions = {
  sensitiveKeys: ReadonlySet<string>;
};

const CIRCULAR_VALUE = '[Circular]';
const NON_PLAIN_OBJECT_VALUE = '[NonPlainObject]';
const OVERSIZED_ARRAY_VALUE = '[OversizedArray]';
const REDACTED_VALUE = '[REDACTED]';
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const MAX_ARRAY_INDEX = 2 ** 32 - 2;
const MAX_SANITIZED_ARRAY_LENGTH = 10_000;
const MAX_SANITIZED_OVERSIZED_ARRAY_ENTRIES = 1_000;

export const DEFAULT_SENSITIVE_LOG_KEYS = new Set(
  [
    'authorization',
    'cookie',
    'email',
    'idToken',
    'name',
    'password',
    'phone',
    'refreshToken',
    'secret',
    'sessionToken',
    'token',
  ].map((key) => key.toLowerCase())
);

const redactString = (value: string) =>
  value.replace(EMAIL_PATTERN, REDACTED_VALUE);

const isSensitiveKey = (key: string, sensitiveKeys: ReadonlySet<string>) =>
  sensitiveKeys.has(key) || sensitiveKeys.has(key.toLowerCase());

const isPlainObject = (value: object) => {
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
};

const isArrayIndexKey = (key: string) => {
  const index = Number(key);

  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index <= MAX_ARRAY_INDEX &&
    String(index) === key
  );
};

const getArrayIndexKeys = (value: unknown[]) =>
  Object.keys(value).filter(isArrayIndexKey);

const getBoundedArrayIndexKeys = (value: unknown[], limit: number) => {
  const indexKeys: string[] = [];
  let hasMore = false;

  // eslint-disable-next-line @typescript-eslint/no-for-in-array -- Oversized sparse arrays need present-index enumeration without collecting all keys or walking declared length.
  for (const key in value) {
    if (!Object.hasOwn(value, key)) {
      continue;
    }

    if (isArrayIndexKey(key)) {
      if (indexKeys.length < limit) {
        indexKeys.push(key);
      } else {
        hasMore = true;
        break;
      }
    }
  }

  indexKeys.sort((a, b) => Number(a) - Number(b));

  return { hasMore, indexKeys };
};

const sanitizeLogValue = (
  key: string,
  value: unknown,
  { sensitiveKeys }: NormalizedSanitizeLogFieldsOptions,
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

  if (typeof (value as { toJSON?: unknown }).toJSON === 'function') {
    path.add(value);
    try {
      return sanitizeLogValue(
        key,
        (value as { toJSON: () => unknown }).toJSON(),
        { sensitiveKeys },
        path
      );
    } catch {
      return NON_PLAIN_OBJECT_VALUE;
    } finally {
      path.delete(value);
    }
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
      if (value.length > MAX_SANITIZED_ARRAY_LENGTH) {
        const { hasMore, indexKeys } = getBoundedArrayIndexKeys(
          value,
          MAX_SANITIZED_OVERSIZED_ARRAY_ENTRIES
        );

        return {
          type: OVERSIZED_ARRAY_VALUE,
          length: value.length,
          entries: pullObject(
            indexKeys,
            (indexKey) => indexKey,
            (indexKey) =>
              sanitizeLogValue(
                '',
                value[Number(indexKey)],
                { sensitiveKeys },
                path
              )
          ),
          truncatedEntries: hasMore
            ? Math.max(value.length - MAX_SANITIZED_OVERSIZED_ARRAY_ENTRIES, 0)
            : 0,
        };
      }

      const indexKeys = getArrayIndexKeys(value);

      const sanitized: unknown[] = [];
      sanitized.length = value.length;
      for (const indexKey of indexKeys) {
        const index = Number(indexKey);
        sanitized[index] = sanitizeLogValue(
          '',
          value[index],
          { sensitiveKeys },
          path
        );
      }
      return sanitized;
    }

    return mapValues(value as Record<string, unknown>, (entryValue, entryKey) =>
      sanitizeLogValue(entryKey, entryValue, { sensitiveKeys }, path)
    );
  } finally {
    path.delete(value);
  }
};

export const sanitizeLogFields = (
  fields: Record<string, unknown>,
  options: SanitizeLogFieldsOptions = {}
): Record<string, unknown> => {
  const sensitiveKeys = options.sensitiveKeys ?? DEFAULT_SENSITIVE_LOG_KEYS;
  const path = new WeakSet<object>();
  path.add(fields);

  return mapValues(fields, (value, key) =>
    sanitizeLogValue(key, value, { sensitiveKeys }, path)
  );
};
