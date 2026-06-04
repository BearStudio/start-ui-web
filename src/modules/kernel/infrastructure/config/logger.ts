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
  LOGGER_CONSOLE_MIRROR: z.stringbool().optional(),
  LOGGER_PRETTY: z.stringbool().optional(),
});

export type LoggerConfig = {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  consoleMirror: boolean;
};

let cachedLoggerConfig: LoggerConfig | undefined;

export function getLoggerConfig(): LoggerConfig {
  if (cachedLoggerConfig) return cachedLoggerConfig;

  const env = parseEnv(loggerEnvSchema);
  const isProd = isProdRuntimeEnvironment(env);
  cachedLoggerConfig = {
    level: env.LOGGER_LEVEL ?? (isProd ? 'error' : 'info'),
    consoleMirror: env.LOGGER_CONSOLE_MIRROR ?? env.LOGGER_PRETTY ?? !isProd,
  };
  return cachedLoggerConfig;
}
