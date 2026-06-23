import { filter, isTruthy, map, pipe } from 'remeda';
import { z } from 'zod';

import {
  baseEnvSchema,
  isProdRuntimeEnvironment,
  parseEnv,
  shouldSkipEnvValidation,
} from './env-schema';
import { ConfigurationError } from '../../domain/errors/configuration-error';

const zOptionalProviderSecret = () => z.string().optional();
const AUTH_SECRET_MIN_LENGTH = 32;
const AUTH_SECRET_PLACEHOLDERS = new Set([
  'changeme',
  'change-me',
  'change_me',
  'password',
  'replace me',
  'secret',
  'test-auth-key',
]);

const splitCsv = (value?: string) =>
  value === undefined
    ? undefined
    : pipe(
        value.split(','),
        map((item) => item.trim()),
        filter(isTruthy)
      );

const isPlaceholderAuthSecret = (value: string) =>
  AUTH_SECRET_PLACEHOLDERS.has(value.trim().toLowerCase());

const authProviderEnvSchema = baseEnvSchema.extend({
  AUTH_PROVIDER: z.enum(['better-auth', 'workos']).prefault('better-auth'),
});

const betterAuthEnvSchema = baseEnvSchema
  .extend({
    AUTH_SECRET: z.string().trim(),
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
    AUTH_ADMIN_ENDPOINTS_ENABLED: z.stringbool().default(false),
    AUTH_OPENAPI_ENABLED: z.stringbool().default(false),
    GITHUB_CLIENT_ID: zOptionalProviderSecret(),
    GITHUB_CLIENT_SECRET: zOptionalProviderSecret(),
  })
  .superRefine((env, ctx) => {
    if (!shouldSkipEnvValidation(env)) {
      if (env.AUTH_SECRET.length < AUTH_SECRET_MIN_LENGTH) {
        ctx.addIssue({
          code: 'custom',
          path: ['AUTH_SECRET'],
          message: `AUTH_SECRET must be at least ${AUTH_SECRET_MIN_LENGTH} characters`,
        });
      }

      if (isPlaceholderAuthSecret(env.AUTH_SECRET)) {
        ctx.addIssue({
          code: 'custom',
          path: ['AUTH_SECRET'],
          message: 'AUTH_SECRET must not use a placeholder value',
        });
      }
    }

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

export type AuthProvider = 'better-auth' | 'workos';

export type AuthProviderConfig = {
  provider: AuthProvider;
};

export type BetterAuthConfig = {
  secret: string;
  sessionExpirationInSeconds: number;
  sessionUpdateAgeInSeconds: number;
  allowedHosts?: string[];
  trustedOrigins?: string[];
  adminEndpointsEnabled: boolean;
  openApiEnabled: boolean;
  githubClientId?: string;
  githubClientSecret?: string;
};

export type AuthConfig = BetterAuthConfig;

let cachedAuthProviderConfig: AuthProviderConfig | undefined;
let cachedBetterAuthConfig: BetterAuthConfig | undefined;

export function getAuthProviderConfig(): AuthProviderConfig {
  if (cachedAuthProviderConfig) return cachedAuthProviderConfig;

  const env = parseEnv(authProviderEnvSchema);
  cachedAuthProviderConfig = {
    provider: env.AUTH_PROVIDER,
  };
  return cachedAuthProviderConfig;
}

export function getBetterAuthConfig(): BetterAuthConfig {
  if (cachedBetterAuthConfig) return cachedBetterAuthConfig;

  const env = parseEnv(betterAuthEnvSchema);
  cachedBetterAuthConfig = {
    secret: env.AUTH_SECRET,
    sessionExpirationInSeconds: env.AUTH_SESSION_EXPIRATION_IN_SECONDS,
    sessionUpdateAgeInSeconds: env.AUTH_SESSION_UPDATE_AGE_IN_SECONDS,
    allowedHosts: splitCsv(env.AUTH_ALLOWED_HOSTS),
    trustedOrigins: splitCsv(env.AUTH_TRUSTED_ORIGINS),
    adminEndpointsEnabled: env.AUTH_ADMIN_ENDPOINTS_ENABLED,
    openApiEnabled: env.AUTH_OPENAPI_ENABLED,
    githubClientId: env.GITHUB_CLIENT_ID,
    githubClientSecret: env.GITHUB_CLIENT_SECRET,
  };
  return cachedBetterAuthConfig;
}

export function getAuthConfig(): AuthConfig {
  const { provider } = getAuthProviderConfig();
  if (provider !== 'better-auth') {
    throw new ConfigurationError(
      `AUTH_PROVIDER=${provider} is not implemented in this build.`
    );
  }
  return getBetterAuthConfig();
}
