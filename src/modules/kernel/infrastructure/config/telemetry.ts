import { z } from 'zod';

import {
  baseEnvSchema,
  isProdRuntimeEnvironment,
  parseEnv,
} from './env-schema';

const telemetryEnvSchema = baseEnvSchema.extend({
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

export type TelemetryConfig = {
  dsn?: string;
  environment?: string;
  tracesSampleRate: number;
  org?: string;
  project?: string;
  authToken?: string;
};

let cachedTelemetryConfig: TelemetryConfig | undefined;

export function getTelemetryConfig(): TelemetryConfig {
  if (cachedTelemetryConfig) return cachedTelemetryConfig;

  const env = parseEnv(telemetryEnvSchema);
  cachedTelemetryConfig = {
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT,
    tracesSampleRate:
      env.SENTRY_TRACES_SAMPLE_RATE ??
      (isProdRuntimeEnvironment(env) ? 0.1 : 1),
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
    authToken: env.SENTRY_AUTH_TOKEN,
  };
  return cachedTelemetryConfig;
}
