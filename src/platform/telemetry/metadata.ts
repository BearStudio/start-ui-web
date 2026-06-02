import { envClient } from '@/platform/env/client';

import type { TelemetryAttributes } from './types';

type QueryKey = readonly unknown[];

const primitiveDynamicTypes = new Set(['boolean', 'number', 'string']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const sortRecord = (value: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, normalizeForHash(entry)])
  );

export const normalizeForHash = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizeForHash);
  if (isRecord(value)) return sortRecord(value);
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  return String(value);
};

export const stableStringify = (value: unknown): string =>
  JSON.stringify(normalizeForHash(value));

export const hashTelemetryValue = (value: unknown): string => {
  const source = stableStringify(value);
  let hash = 0x811c9dc5;

  for (const character of source) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }

  return `h${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

export const isTelemetryDebugMode = () => {
  if (envClient.DEV || envClient.VITE_TELEMETRY_DEBUG_RAW_VALUES) {
    return true;
  }

  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
};

const dynamicValueLabel = (value: unknown) => {
  if (isTelemetryDebugMode() && primitiveDynamicTypes.has(typeof value)) {
    return String(value);
  }

  return hashTelemetryValue(value);
};

const isQueryKeyVersionSegment = (segment: string) => /^v\d+$/.test(segment);

const stringSegmentsFromQueryKey = (queryKey: QueryKey): string[] =>
  queryKey.filter(
    (segment): segment is string =>
      typeof segment === 'string' && !isQueryKeyVersionSegment(segment)
  );

const dynamicSegmentsFromQueryKey = (queryKey: QueryKey) =>
  queryKey.filter((segment) => typeof segment !== 'string');

export type OperationMetadata = {
  operationName: string;
  attributes: TelemetryAttributes;
};

export const deriveOperationMetadataFromKey = (
  queryKey: QueryKey,
  operationType: 'query' | 'mutation'
): OperationMetadata => {
  const stringSegments = stringSegmentsFromQueryKey(queryKey);
  const dynamicSegments = dynamicSegmentsFromQueryKey(queryKey);
  const operationName = stringSegments.length
    ? stringSegments.join('.')
    : `${operationType}.anonymous`;

  return {
    operationName,
    attributes: {
      'operation.name': operationName,
      'operation.type': operationType,
      'operation.key_static': stringSegments.join('.'),
      'operation.key_dynamic_count': dynamicSegments.length,
      ...(dynamicSegments.length
        ? {
            'operation.key_dynamic_hash': hashTelemetryValue(dynamicSegments),
            'operation.key_dynamic_debug': dynamicSegments
              .map(dynamicValueLabel)
              .join(','),
          }
        : {}),
    },
  };
};

export const hashUserIdForMetrics = (userId: string | undefined) =>
  userId ? hashTelemetryValue(userId) : undefined;
