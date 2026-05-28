import { z } from 'zod';

import {
  baseEnvSchema,
  isProdRuntimeEnvironment,
  parseEnv,
} from './env-schema';

const loggerEnvSchema = baseEnvSchema.extend({
  LOGGER_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .optional(),
  LOGGER_PRETTY: z.enum(['true', 'false']).optional(),
});

export type LoggerConfig = {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  pretty: boolean;
};

let cachedLoggerConfig: LoggerConfig | undefined;

export function getLoggerConfig(): LoggerConfig {
  if (cachedLoggerConfig) return cachedLoggerConfig;

  const env = parseEnv(loggerEnvSchema);
  const isProd = isProdRuntimeEnvironment(env);
  cachedLoggerConfig = {
    level: env.LOGGER_LEVEL ?? (isProd ? 'error' : 'info'),
    pretty: env.LOGGER_PRETTY
      ? env.LOGGER_PRETTY === 'true'
      : isProd
        ? false
        : true,
  };
  return cachedLoggerConfig;
}
