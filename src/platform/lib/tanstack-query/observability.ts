import { getTelemetry } from '@/platform/telemetry';
import {
  deriveOperationMetadataFromKey,
  type OperationMetadata,
} from '@/platform/telemetry/metadata';

type OperationType = 'mutation' | 'query';

const isPromiseLike = <T>(value: T): value is T & Promise<Awaited<T>> =>
  value !== null &&
  value !== undefined &&
  typeof value === 'object' &&
  'then' in value &&
  typeof (value as { then?: unknown }).then === 'function';

const recordOperationMetric = (
  metadata: OperationMetadata,
  durationMs: number,
  status: 'error' | 'success'
) => {
  getTelemetry().recordMetric({
    attributes: {
      ...metadata.attributes,
      status,
    },
    name: 'app.query.operation.duration',
    type: 'histogram',
    unit: 'ms',
    value: durationMs,
  });
};

export const observeQueryOperation = <T>(
  queryKey: readonly unknown[],
  operationType: OperationType,
  fn: () => T
): T => {
  const metadata = deriveOperationMetadataFromKey(queryKey, operationType);
  const start = performance.now();

  return getTelemetry().startSpan(
    {
      attributes: metadata.attributes,
      name: `${operationType}.${metadata.operationName}`,
      op: `tanstack.${operationType}`,
    },
    () => {
      try {
        const result = fn();
        if (!isPromiseLike(result)) {
          recordOperationMetric(metadata, performance.now() - start, 'success');
          return result;
        }

        return result
          .then((value) => {
            recordOperationMetric(
              metadata,
              performance.now() - start,
              'success'
            );
            return value;
          })
          .catch((error: unknown) => {
            recordOperationMetric(metadata, performance.now() - start, 'error');
            throw error;
          }) as T;
      } catch (error) {
        recordOperationMetric(metadata, performance.now() - start, 'error');
        throw error;
      }
    }
  );
};

export const recordQueryCacheEvent = (
  queryKey: readonly unknown[],
  operationType: OperationType,
  status: 'error' | 'success'
) => {
  const metadata = deriveOperationMetadataFromKey(queryKey, operationType);
  getTelemetry().recordMetric({
    attributes: {
      ...metadata.attributes,
      status,
    },
    name: 'app.query.cache.event',
    type: 'counter',
    value: 1,
  });
};
