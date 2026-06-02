import { metrics } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

import { envClient } from '@/platform/env/client';
import type { TelemetryAdapter } from '@/platform/telemetry';

import { createOpenTelemetryAdapter } from './otel-adapter';

const TELEMETRY_PATH_PATTERN = /\/api\/telemetry\//;
const VENDOR_PATTERN = /(?:sentry\.io|honeycomb\.io|otel|collector)/;

let initialized = false;
let adapter: TelemetryAdapter | undefined;

const sameOriginPattern = () => {
  if (typeof window === 'undefined') return /^\/(?!api\/telemetry\/)/;

  const escapedOrigin = window.location.origin.replace(
    /[.*+?^${}()|[\]\\]/g,
    String.raw`\$&`
  );
  return new RegExp(`^${escapedOrigin}/(?!api/telemetry/)`);
};

const createClientResource = () =>
  resourceFromAttributes({
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]:
      envClient.VITE_OTEL_ENVIRONMENT ??
      envClient.VITE_SENTRY_ENVIRONMENT ??
      envClient.VITE_ENV_NAME ??
      'local',
    [ATTR_SERVICE_NAME]: envClient.VITE_OTEL_SERVICE_NAME,
    ...(envClient.VITE_OTEL_SERVICE_VERSION
      ? { [ATTR_SERVICE_VERSION]: envClient.VITE_OTEL_SERVICE_VERSION }
      : {}),
  });

export const initOpenTelemetryClient = (): TelemetryAdapter | undefined => {
  if (initialized) return adapter;
  initialized = true;

  if (!envClient.VITE_OTEL_BROWSER_ENABLED) {
    return undefined;
  }

  const resource = createClientResource();
  const traceExporter = new OTLPTraceExporter({
    url: '/api/telemetry/otel/v1/traces',
  });
  const provider = new WebTracerProvider({
    resource,
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(
        envClient.VITE_OTEL_TRACES_SAMPLE_RATE
      ),
    }),
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
  });

  provider.register({
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
          url: '/api/telemetry/otel/v1/metrics',
        }),
        exportIntervalMillis: 30_000,
      }),
    ],
    resource,
  });
  metrics.setGlobalMeterProvider(meterProvider);

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        clearTimingResources: true,
        ignoreUrls: [TELEMETRY_PATH_PATTERN, VENDOR_PATTERN],
        propagateTraceHeaderCorsUrls: [sameOriginPattern()],
        semconvStabilityOptIn: 'http',
      }),
    ],
    meterProvider,
    tracerProvider: provider,
  });

  adapter = createOpenTelemetryAdapter();
  return adapter;
};
