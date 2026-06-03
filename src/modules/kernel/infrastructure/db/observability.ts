import { timingStore } from '@/modules/kernel/transport/tanstack/timing-store';
import type {
  TelemetryAttributes,
  TelemetrySpanHandle,
  TelemetrySpanOptions,
} from '@/platform/telemetry';
import { getTelemetry } from '@/platform/telemetry';

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

const noopSpan: TelemetrySpanHandle = {
  addEvent: () => {},
  end: () => {},
  recordException: () => {},
  setAttributes: () => {},
  setStatus: () => {},
};

const safelyRecordTelemetry = (record: () => void) => {
  try {
    record();
  } catch {
    // Observability must never change repository behavior.
  }
};

const startManualSpan = (options: TelemetrySpanOptions) => {
  try {
    return getTelemetry().startManualSpan(options);
  } catch {
    return noopSpan;
  }
};

const completeDbObservation = ({
  attributes,
  durationMs,
  error,
  input,
  span,
  status,
}: {
  attributes: TelemetryAttributes;
  durationMs: number;
  error?: unknown;
  input: DbOperationInput;
  span: TelemetrySpanHandle;
  status: 'success' | 'error';
}) => {
  const metricAttributes = {
    ...attributes,
    status,
  } satisfies TelemetryAttributes;
  const spanAttributes = {
    ...metricAttributes,
    'db.operation.duration_ms': durationMs,
  } satisfies TelemetryAttributes;

  safelyRecordTelemetry(() => {
    timingStore.getStore()?.db?.push({
      duration: durationMs,
      model: input.model,
      operation: input.operation,
    });
  });
  safelyRecordTelemetry(() => span.setAttributes(spanAttributes));
  if (error !== undefined) {
    safelyRecordTelemetry(() => span.recordException(error));
  }
  safelyRecordTelemetry(() => {
    if (status === 'error') {
      if (error instanceof Error) {
        span.setStatus('error', error.message);
        return;
      }

      span.setStatus('error');
      return;
    }

    span.setStatus('ok');
  });
  safelyRecordTelemetry(() => span.end());
  safelyRecordTelemetry(() => {
    getTelemetry().recordMetric({
      attributes: metricAttributes,
      name: 'app.db.operation.duration',
      type: 'histogram',
      unit: 'ms',
      value: durationMs,
    });
  });
};

export function observeDbOperation<T>(
  input: DbOperationInput,
  work: () => T
): T {
  const attributes = attributesForOperation(input);
  const startedAt = performance.now();
  const span = startManualSpan({
    attributes,
    name: `db.${input.model}.${input.operation}`,
    op: 'db.repository',
  });

  const finish = <TValue>(value: TValue): TValue => {
    const durationMs = performance.now() - startedAt;
    const status = resultStatus(value);
    completeDbObservation({
      attributes,
      durationMs,
      input,
      span,
      status,
    });

    return value;
  };

  const fail = (error: unknown): never => {
    const durationMs = performance.now() - startedAt;
    completeDbObservation({
      attributes,
      durationMs,
      error,
      input,
      span,
      status: 'error',
    });

    throw error;
  };

  try {
    const result = work();
    if (!isPromiseLike(result)) return finish(result);

    return result.then(finish, fail) as T;
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
