import { timingStore } from '@/modules/kernel/transport/tanstack/timing-store';
import { getTelemetry } from '@/platform/telemetry';
import type { TelemetryAttributes } from '@/platform/telemetry';

type DbOperationInput = {
  model: string;
  operation: string;
};

const isPromiseLike = <T>(value: T): value is T & Promise<Awaited<T>> =>
  value != null &&
  typeof value === 'object' &&
  'then' in value &&
  typeof (value as { then?: unknown }).then === 'function';

const resultStatus = (value: unknown): 'success' | 'error' => {
  if (
    value &&
    typeof value === 'object' &&
    'isError' in value &&
    typeof (value as { isError?: unknown }).isError === 'function'
  ) {
    return (value as { isError: () => boolean }).isError()
      ? 'error'
      : 'success';
  }

  return 'success';
};

const attributesForOperation = ({
  model,
  operation,
}: DbOperationInput): TelemetryAttributes => ({
  'db.collection.name': model,
  'db.operation.name': operation,
  'db.system': 'postgresql',
});

export function observeDbOperation<T>(
  input: DbOperationInput,
  work: () => T
): T {
  const attributes = attributesForOperation(input);
  const startedAt = performance.now();
  const span = getTelemetry().startManualSpan({
    attributes,
    name: `db.${input.model}.${input.operation}`,
    op: 'db.repository',
  });

  const finish = <TValue>(value: TValue): TValue => {
    const durationMs = performance.now() - startedAt;
    const status = resultStatus(value);
    const statusAttributes = {
      ...attributes,
      'db.operation.duration_ms': durationMs,
      status,
    } satisfies TelemetryAttributes;

    timingStore.getStore()?.db.push({
      duration: durationMs,
      model: input.model,
      operation: input.operation,
    });
    span.setAttributes(statusAttributes);
    span.setStatus(status === 'error' ? 'error' : 'ok');
    span.end();
    getTelemetry().recordMetric({
      attributes: statusAttributes,
      name: 'app.db.operation.duration',
      type: 'histogram',
      unit: 'ms',
      value: durationMs,
    });

    return value;
  };

  const fail = (error: unknown): never => {
    const durationMs = performance.now() - startedAt;
    const statusAttributes = {
      ...attributes,
      'db.operation.duration_ms': durationMs,
      status: 'error',
    } satisfies TelemetryAttributes;

    timingStore.getStore()?.db.push({
      duration: durationMs,
      model: input.model,
      operation: input.operation,
    });
    span.setAttributes(statusAttributes);
    span.recordException(error);
    span.setStatus('error', error instanceof Error ? error.message : undefined);
    span.end();
    getTelemetry().recordMetric({
      attributes: statusAttributes,
      name: 'app.db.operation.duration',
      type: 'histogram',
      unit: 'ms',
      value: durationMs,
    });

    throw error;
  };

  try {
    const result = work();
    if (!isPromiseLike(result)) return finish(result);

    return result.then(finish).catch(fail) as T;
  } catch (error) {
    return fail(error);
  }
}

export function observeRepository<TRepository extends object>(
  repository: TRepository,
  model: string
): TRepository {
  const wrappers = new Map<PropertyKey, unknown>();

  return new Proxy(repository, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof property === 'symbol' || typeof value !== 'function') {
        return value;
      }

      const existing = wrappers.get(property);
      if (existing) return existing;

      const wrapped = (...args: unknown[]) =>
        observeDbOperation({ model, operation: property }, () =>
          (value as (...methodArgs: unknown[]) => unknown).apply(target, args)
        );

      wrappers.set(property, wrapped);
      return wrapped;
    },
  });
}
