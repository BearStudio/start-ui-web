import { metrics } from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  BatchSpanProcessor,
  NodeTracerProvider,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

import { getTelemetryConfig } from '@/modules/kernel/infrastructure/config/telemetry';
import type { TelemetryAdapter } from '@/platform/telemetry';

import { createOpenTelemetryAdapter } from './otel-adapter';

let initialized = false;
let adapter: TelemetryAdapter | undefined;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const signalUrl = (
  collectorUrl: string,
  signal: 'logs' | 'metrics' | 'traces'
) => `${trimTrailingSlash(collectorUrl)}/v1/${signal}`;

const createResource = () => {
  const config = getTelemetryConfig();
  return resourceFromAttributes({
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: config.otelEnvironment,
    [ATTR_SERVICE_NAME]: config.serviceName,
    ...(config.serviceVersion
      ? { [ATTR_SERVICE_VERSION]: config.serviceVersion }
      : {}),
  });
};

const exporterHeaders = () => {
  const { collectorBearerToken } = getTelemetryConfig();
  return collectorBearerToken
    ? { Authorization: `Bearer ${collectorBearerToken}` }
    : undefined;
};

export const initOpenTelemetryServer = (): TelemetryAdapter | undefined => {
  if (initialized) return adapter;
  initialized = true;

  const config = getTelemetryConfig();
  if (!config.collectorUrl) {
    return undefined;
  }

  const resource = createResource();
  const headers = exporterHeaders();
  const tracerProvider = new NodeTracerProvider({
    resource,
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(config.otelTracesSampleRate),
    }),
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          headers,
          url: signalUrl(config.collectorUrl, 'traces'),
        })
      ),
    ],
  });

  tracerProvider.register({
    propagator: new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
      ],
    }),
  });

  const meterProvider = new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          headers,
          url: signalUrl(config.collectorUrl, 'metrics'),
        }),
        exportIntervalMillis: 30_000,
      }),
    ],
    resource,
  });
  metrics.setGlobalMeterProvider(meterProvider);

  const loggerProvider = new LoggerProvider({
    processors: [
      new BatchLogRecordProcessor(
        new OTLPLogExporter({
          headers,
          url: signalUrl(config.collectorUrl, 'logs'),
        })
      ),
    ],
    resource,
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  adapter = createOpenTelemetryAdapter();
  return adapter;
};
