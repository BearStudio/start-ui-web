import { z } from 'zod';

import {
  baseEnvSchema,
  isProdRuntimeEnvironment,
  parseEnv,
  zNonEmptyEnvString,
} from './env-schema';

const zOptionalProviderSecret = () => z.string().optional();

const splitCsv = (value?: string) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const authEnvSchema = baseEnvSchema
  .extend({
    AUTH_SECRET: zNonEmptyEnvString(),
    AUTH_SESSION_EXPIRATION_IN_SECONDS: z.coerce
      .number()
      .int()
      .min(1)
      .prefault(2_592_000),
    AUTH_SESSION_UPDATE_AGE_IN_SECONDS: z.coerce
      .number()
      .int()
      .min(1)
      .prefault(86_400),
    AUTH_ALLOWED_HOSTS: z.string().optional(),
    AUTH_TRUSTED_ORIGINS: z.string().optional(),
    GITHUB_CLIENT_ID: zOptionalProviderSecret(),
    GITHUB_CLIENT_SECRET: zOptionalProviderSecret(),
  })
  .superRefine((env, ctx) => {
    if (!isProdRuntimeEnvironment(env)) return;

    for (const field of ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'] as const) {
      if (env[field] === 'REPLACE ME') {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'Update the value "REPLACE ME" or remove the variable',
        });
      }
    }
  })
  .transform((env) => ({
    ...env,
    GITHUB_CLIENT_ID:
      env.GITHUB_CLIENT_ID === 'REPLACE ME' ? undefined : env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET:
      env.GITHUB_CLIENT_SECRET === 'REPLACE ME'
        ? undefined
        : env.GITHUB_CLIENT_SECRET,
  }));

export type AuthConfig = {
  secret: string;
  sessionExpirationInSeconds: number;
  sessionUpdateAgeInSeconds: number;
  allowedHosts?: string[];
  trustedOrigins?: string[];
  githubClientId?: string;
  githubClientSecret?: string;
};

let cachedAuthConfig: AuthConfig | undefined;

export function getAuthConfig(): AuthConfig {
  if (cachedAuthConfig) return cachedAuthConfig;

  const env = parseEnv(authEnvSchema);
  cachedAuthConfig = {
    secret: env.AUTH_SECRET,
    sessionExpirationInSeconds: env.AUTH_SESSION_EXPIRATION_IN_SECONDS,
    sessionUpdateAgeInSeconds: env.AUTH_SESSION_UPDATE_AGE_IN_SECONDS,
    allowedHosts: splitCsv(env.AUTH_ALLOWED_HOSTS),
    trustedOrigins: splitCsv(env.AUTH_TRUSTED_ORIGINS),
    githubClientId: env.GITHUB_CLIENT_ID,
    githubClientSecret: env.GITHUB_CLIENT_SECRET,
  };
  return cachedAuthConfig;
}
