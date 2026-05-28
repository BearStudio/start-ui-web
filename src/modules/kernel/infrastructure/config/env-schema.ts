/* oxlint-disable no-process-env */
import { z } from 'zod';

import { ConfigurationError } from '../../domain/errors/configuration-error';

type RuntimeEnv = Record<string, unknown>;

const runtimeEnv = (): RuntimeEnv => ({
  ...(typeof process === 'undefined' ? {} : process.env),
  ...(import.meta as ImportMeta & { env?: RuntimeEnv }).env,
});

const isTruthy = (value: unknown) => value === true || value === 'true';

export const isProdRuntimeEnvironment = (source?: RuntimeEnv) => {
  const env = source ?? runtimeEnv();
  return env.NODE_ENV ? env.NODE_ENV === 'production' : isTruthy(env.PROD);
};

export const isDevRuntimeEnvironment = (source?: RuntimeEnv) => {
  const env = source ?? runtimeEnv();
  return env.NODE_ENV ? env.NODE_ENV === 'development' : isTruthy(env.DEV);
};

export const zNonEmptyEnvString = () => z.string().trim().min(1);

export const baseEnvSchema = z
  .object({
    NODE_ENV: z.string().optional(),
    VERCEL_ENV: z.string().optional(),
  })
  .passthrough();

const fieldNameFromIssue = (issue: z.core.$ZodIssue) =>
  issue.path.length ? issue.path.map(String).join('.') : 'environment';

export function parseEnv<TSchema extends z.ZodType>(
  schema: TSchema,
  source?: Record<string, unknown>
): z.infer<TSchema> {
  const result = schema.safeParse(source ?? runtimeEnv());
  if (result.success) return result.data;

  const issues = result.error.issues.map((issue) => ({
    field: fieldNameFromIssue(issue),
    message: issue.message,
  }));
  const fields = [...new Set(issues.map((issue) => issue.field))].join(', ');

  throw new ConfigurationError(`Invalid environment configuration: ${fields}`, {
    details: { issues },
    cause: result.error,
  });
}
