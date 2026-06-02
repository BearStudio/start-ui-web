import { z } from 'zod';

import {
  baseEnvSchema,
  isProdRuntimeEnvironment,
  parseEnv,
} from './env-schema';

const telemetryEnvSchema = baseEnvSchema.extend({
  SENTRY_DSN: z.string().url().optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  OTEL_COLLECTOR_URL: z.string().url().optional(),
  OTEL_COLLECTOR_BEARER_TOKEN: z.string().optional(),
  OTEL_SERVICE_NAME: z.string().optional(),
  OTEL_SERVICE_VERSION: z.string().optional(),
  OTEL_ENVIRONMENT: z.string().optional(),
  OTEL_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
  OTEL_LOCAL_SQLITE_ENABLED: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  OTEL_LOCAL_SQLITE_PATH: z.string().optional(),
  TELEMETRY_PROXY_MAX_BYTES: z.coerce.number().int().positive().optional(),
  TELEMETRY_LOG_MAX_EVENTS: z.coerce.number().int().positive().optional(),
});

export type TelemetryConfig = {
  dsn?: string;
  browserDsn?: string;
  environment?: string;
  tracesSampleRate: number;
  org?: string;
  project?: string;
  authToken?: string;
  collectorUrl?: string;
  collectorBearerToken?: string;
  serviceName: string;
  serviceVersion?: string;
  otelEnvironment?: string;
  otelTracesSampleRate: number;
  localSqliteEnabled: boolean;
  localSqlitePath: string;
  proxyMaxBytes: number;
  logMaxEvents: number;
};

let cachedTelemetryConfig: TelemetryConfig | undefined;

export function getTelemetryConfig(): TelemetryConfig {
  if (cachedTelemetryConfig) return cachedTelemetryConfig;

  const env = parseEnv(telemetryEnvSchema);
  const isProduction = isProdRuntimeEnvironment(env);
  cachedTelemetryConfig = {
    dsn: env.SENTRY_DSN,
    browserDsn: env.VITE_SENTRY_DSN ?? env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE ?? (isProduction ? 0.1 : 1),
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
    authToken: env.SENTRY_AUTH_TOKEN,
    collectorUrl: env.OTEL_COLLECTOR_URL,
    collectorBearerToken: env.OTEL_COLLECTOR_BEARER_TOKEN,
    serviceName: env.OTEL_SERVICE_NAME ?? 'start-ui-web',
    serviceVersion: env.OTEL_SERVICE_VERSION,
    otelEnvironment:
      env.OTEL_ENVIRONMENT ??
      env.SENTRY_ENVIRONMENT ??
      (isProduction ? 'production' : 'local'),
    otelTracesSampleRate: env.OTEL_TRACES_SAMPLE_RATE ?? 1,
    localSqliteEnabled: env.OTEL_LOCAL_SQLITE_ENABLED ?? !isProduction,
    localSqlitePath:
      env.OTEL_LOCAL_SQLITE_PATH ?? '.telemetry/telemetry.sqlite',
    proxyMaxBytes: env.TELEMETRY_PROXY_MAX_BYTES ?? 1_000_000,
    logMaxEvents: env.TELEMETRY_LOG_MAX_EVENTS ?? 50,
  };
  return cachedTelemetryConfig;
}
