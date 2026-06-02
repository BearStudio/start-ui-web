import { createNoOpTelemetry } from './no-op';
import type { TelemetryAdapter } from './types';

let activeAdapter: TelemetryAdapter = createNoOpTelemetry();

export const setTelemetry = (adapter: TelemetryAdapter) => {
  activeAdapter = adapter;
};

export const getTelemetry = (): TelemetryAdapter => activeAdapter;

export const telemetryProxy: TelemetryAdapter = {
  captureException: (error, context) =>
    activeAdapter.captureException(error, context),
  setUser: (user) => activeAdapter.setUser(user),
  startSpan: (options, fn) => activeAdapter.startSpan(options, fn),
  startManualSpan: (options) => activeAdapter.startManualSpan(options),
  currentCorrelation: () => activeAdapter.currentCorrelation(),
  emitLog: (record) => activeAdapter.emitLog(record),
  recordMetric: (input) => activeAdapter.recordMetric(input),
};
