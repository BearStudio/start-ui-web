export { createNoOpTelemetry } from './no-op';
export { getTelemetry, setTelemetry, telemetryProxy } from './runtime';
export { toTelemetryStringTags } from './tags';
export type {
  TelemetryAdapter,
  TelemetryAttributes,
  TelemetryCaptureContext,
  TelemetryCorrelation,
  TelemetryLogLevel,
  TelemetryLogRecord,
  TelemetryMetricInput,
  TelemetryMetricType,
  TelemetrySpanHandle,
  TelemetrySpanOptions,
  TelemetrySpanStatus,
  TelemetryUser,
} from './types';
