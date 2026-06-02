/* oxlint-disable no-process-env */
import { z } from 'zod';

type RuntimeEnv = Record<string, unknown>;

const runtimeEnv = (): RuntimeEnv => ({
  ...(typeof process === 'undefined' ? {} : process.env),
  ...import.meta.env,
});

const isTruthy = (value: unknown) => value === true || value === 'true';

const isProd = () => {
  const env = runtimeEnv();
  return env.NODE_ENV ? env.NODE_ENV === 'production' : isTruthy(env.PROD);
};

const isDev = () => {
  const env = runtimeEnv();
  return env.NODE_ENV ? env.NODE_ENV === 'development' : isTruthy(env.DEV);
};

export const isDevEnvironment = isDev;

const getBaseUrl = (env: RuntimeEnv) => {
  const vercelUrlPreviewUrl =
    env.VITE_VERCEL_ENV === 'preview' ? env.VITE_VERCEL_BRANCH_URL : null;

  if (typeof vercelUrlPreviewUrl === 'string' && vercelUrlPreviewUrl) {
    return `https://${vercelUrlPreviewUrl}`;
  }

  return env.VITE_BASE_URL;
};

const clientSchema = () =>
  z.object({
    VITE_BASE_URL: z.url(),
    VITE_IS_DEMO: z
      .enum(['true', 'false'])
      .optional()
      .prefault('false')
      .transform((value) => value === 'true'),
    VITE_VISUAL_TEST: z
      .enum(['true', 'false'])
      .optional()
      .prefault('false')
      .transform((value) => value === 'true'),
    DEV: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((value) => (value === undefined ? isDev() : isTruthy(value))),
    VITE_ENV_NAME: z
      .string()
      .optional()
      .transform((value) => value ?? (isDev() ? 'LOCAL' : undefined)),
    VITE_ENV_EMOJI: z
      .emoji()
      .optional()
      .transform((value) => value ?? (isDev() ? '🚧' : undefined)),
    VITE_ENV_COLOR: z
      .string()
      .optional()
      .transform((value) => value ?? (isDev() ? 'gold' : 'plum')),
    VITE_S3_BUCKET_PUBLIC_URL: z.url(),
    VITE_SENTRY_DSN: z.string().url().optional(),
    VITE_SENTRY_ENVIRONMENT: z.string().optional(),
    VITE_SENTRY_TRACES_SAMPLE_RATE: z.coerce
      .number()
      .min(0)
      .max(1)
      .prefault(isProd() ? 0.1 : 1),
    VITE_OTEL_BROWSER_ENABLED: z
      .enum(['true', 'false'])
      .optional()
      .prefault('true')
      .transform((value) => value === 'true'),
    VITE_OTEL_SERVICE_NAME: z.string().optional().prefault('start-ui-web'),
    VITE_OTEL_SERVICE_VERSION: z.string().optional(),
    VITE_OTEL_ENVIRONMENT: z.string().optional(),
    VITE_OTEL_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).prefault(1),
    VITE_TELEMETRY_DEBUG_RAW_VALUES: z
      .enum(['true', 'false'])
      .optional()
      .prefault('false')
      .transform((value) => value === 'true'),
    VITE_SENTRY_TUNNEL_PATH: z
      .string()
      .optional()
      .prefault('/api/telemetry/sentry-tunnel'),
  });

export type EnvClient = z.infer<ReturnType<typeof clientSchema>>;

let cachedClientEnv: EnvClient | undefined;

export function getEnvClient(): EnvClient {
  if (cachedClientEnv) return cachedClientEnv;
  const raw = runtimeEnv();
  cachedClientEnv = clientSchema().parse({
    ...raw,
    VITE_BASE_URL: getBaseUrl(raw),
  });
  return cachedClientEnv;
}

export const envClient = new Proxy({} as EnvClient, {
  get: (_target, property: keyof EnvClient) => getEnvClient()[property],
});
