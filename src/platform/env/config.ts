/* oxlint-disable no-process-env */
import { z } from 'zod';

type RuntimeEnv = Record<string, unknown>;

const runtimeEnv = (): RuntimeEnv => ({
  ...(typeof process === 'undefined' ? {} : process.env),
  ...import.meta.env,
});

const isTruthy = (value: unknown) => value === true || value === 'true';
const zNonEmptyString = () => z.string().trim().min(1);

const isProd = () => {
  const env = runtimeEnv();
  return env.NODE_ENV ? env.NODE_ENV === 'production' : isTruthy(env.PROD);
};

const isDev = () => {
  const env = runtimeEnv();
  return env.NODE_ENV ? env.NODE_ENV === 'development' : isTruthy(env.DEV);
};

const zOptionalWithReplaceMe = () =>
  z
    .string()
    .optional()
    .refine((value) => !isProd() || value !== 'REPLACE ME', {
      error: 'Update the value "REPLACE ME" or remove the variable',
    })
    .transform((value) => (value === 'REPLACE ME' ? undefined : value));

const getBaseUrl = (env: RuntimeEnv) => {
  const vercelUrlPreviewUrl =
    env.VITE_VERCEL_ENV === 'preview' ? env.VITE_VERCEL_BRANCH_URL : null;

  if (typeof vercelUrlPreviewUrl === 'string' && vercelUrlPreviewUrl) {
    return `https://${vercelUrlPreviewUrl}`;
  }

  return env.VITE_BASE_URL;
};

const serverSchema = () =>
  z.object({
    DATABASE_URL: z.url(),
    AUTH_SECRET: zNonEmptyString(),
    AUTH_SESSION_EXPIRATION_IN_SECONDS: z.coerce
      .number()
      .int()
      .min(1)
      .prefault(2592000),
    AUTH_SESSION_UPDATE_AGE_IN_SECONDS: z.coerce
      .number()
      .int()
      .min(1)
      .prefault(86400),
    AUTH_ALLOWED_HOSTS: z
      .string()
      .optional()
      .transform((value) => value?.split(',').map((v) => v.trim())),
    AUTH_TRUSTED_ORIGINS: z
      .string()
      .optional()
      .transform((value) => value?.split(',').map((v) => v.trim())),
    GITHUB_CLIENT_ID: zOptionalWithReplaceMe(),
    GITHUB_CLIENT_SECRET: zOptionalWithReplaceMe(),
    RESEND_API_KEY: zNonEmptyString().refine(
      (value) => !isProd() || value !== 'REPLACE ME',
      {
        error: 'Update RESEND_API_KEY for production',
      }
    ),
    EMAIL_FROM: zNonEmptyString(),
    EMAIL_DELIVERY_DISABLED: z.stringbool().default(false),
    LOGGER_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .prefault(isProd() ? 'error' : 'info'),
    LOGGER_PRETTY: z
      .enum(['true', 'false'])
      .prefault(isProd() ? 'false' : 'true')
      .transform((value) => value === 'true'),
    S3_ACCESS_KEY_ID: zNonEmptyString(),
    S3_SECRET_ACCESS_KEY: zNonEmptyString(),
    S3_BUCKET_NAME: zNonEmptyString().default('default'),
    S3_REGION: zNonEmptyString().default('auto'),
    S3_HOST: zNonEmptyString(),
    S3_SECURE: z.stringbool().default(true),
    S3_FORCE_PATH_STYLE: z.stringbool().default(false),
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ENVIRONMENT: z.string().optional(),
    SENTRY_TRACES_SAMPLE_RATE: z.coerce
      .number()
      .min(0)
      .max(1)
      .prefault(isProd() ? 0.1 : 1),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
  });

const clientSchema = () =>
  z.object({
    VITE_BASE_URL: z.url(),
    VITE_IS_DEMO: z
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
  });

export type EnvServer = z.infer<ReturnType<typeof serverSchema>>;
export type EnvClient = z.infer<ReturnType<typeof clientSchema>>;
export type Env = EnvServer & EnvClient;

let cachedServerEnv: EnvServer | undefined;
let cachedClientEnv: EnvClient | undefined;

export function getEnvServer(): EnvServer {
  if (cachedServerEnv) return cachedServerEnv;
  cachedServerEnv = serverSchema().parse(runtimeEnv());
  return cachedServerEnv;
}

export function getEnvClient(): EnvClient {
  if (cachedClientEnv) return cachedClientEnv;
  const raw = runtimeEnv();
  cachedClientEnv = clientSchema().parse({
    ...raw,
    VITE_BASE_URL: getBaseUrl(raw),
  });
  return cachedClientEnv;
}

export const envServer = new Proxy({} as EnvServer, {
  get: (_target, property: keyof EnvServer) => getEnvServer()[property],
});

export const envClient = new Proxy({} as EnvClient, {
  get: (_target, property: keyof EnvClient) => getEnvClient()[property],
});

export const env = new Proxy({} as Env, {
  get: (target, property) => {
    if (typeof property === 'symbol' || property in Object.prototype) {
      return Reflect.get(target, property);
    }
    const prop = String(property);
    if (prop.startsWith('VITE_')) {
      return getEnvClient()[prop as keyof EnvClient];
    }
    return getEnvServer()[prop as keyof EnvServer];
  },
});
