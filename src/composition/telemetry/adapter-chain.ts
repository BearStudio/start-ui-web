import type { TelemetryAdapter } from '@/platform/telemetry';

export const createTelemetryAdapterChain = (
  adapters: readonly TelemetryAdapter[]
): TelemetryAdapter => {
  const [primary] = adapters;

  if (!primary) {
    throw new Error('Telemetry adapter chain requires at least one adapter');
  }

  return {
    captureException: (error, context) => {
      for (const adapter of adapters) {
        adapter.captureException(error, context);
      }
    },
    currentCorrelation: () => primary.currentCorrelation(),
    emitLog: (record) => {
      for (const adapter of adapters) {
        adapter.emitLog(record);
      }
    },
    recordMetric: (input) => {
      for (const adapter of adapters) {
        adapter.recordMetric(input);
      }
    },
    setUser: (user) => {
      for (const adapter of adapters) {
        adapter.setUser(user);
      }
    },
    startManualSpan: (options) => primary.startManualSpan(options),
    startSpan: (options, fn) => primary.startSpan(options, fn),
  };
};
