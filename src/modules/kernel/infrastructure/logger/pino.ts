import { black, blue, cyan, gray, green, magenta, red } from 'colorette';
import pino from 'pino';
import pretty from 'pino-pretty';
import { z } from 'zod';

import { env } from '@/modules/kernel/infrastructure/config/env';

export function createPinoLogger(options?: pino.LoggerOptions) {
  const loggerOptions: pino.LoggerOptions = {
    level: env.LOGGER_LEVEL,
    ...options,
  };

  return env.LOGGER_PRETTY
    ? pino(
        loggerOptions,
        pretty({
          ignore:
            'scope,type,path,pid,hostname,requestId,durationMs,userId,errorCode,errorMessage',
          messageFormat: (log, messageKey) => {
            const {
              requestId,
              scope,
              type,
              path,
              durationMs,
              message,
              userId,
              errorCode,
              errorMessage,
            } = z
              .object({
                requestId: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? `${gray(v)} - ` : '')),
                userId: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) =>
                    v ? `👤 ${cyan(v)} - ` : magenta('🕶️  Anonymous ')
                  ),
                scope: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? gray(`(${v})`) : '')),
                type: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) =>
                    v ? `${green(v.toLocaleUpperCase())} on ` : ''
                  ),
                path: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? `${blue(v)} ` : '')),
                durationMs: z
                  .number()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? gray(`(took ${v}ms) `) : '')),
                message: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? black(`${v} `) : '')),
                errorCode: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? red(`[${v}] `) : '')),
                errorMessage: z
                  .string()
                  .optional()
                  .catch(undefined)
                  .transform((v) => (v ? black(`${v} `) : '')),
              })
              .parse({ ...log, message: log[messageKey] });

            const error =
              errorCode || errorMessage ? `· ${errorCode}${errorMessage}` : '';

            return black(
              `${userId}${requestId}${type}${path}· ${message}${error}${scope}${durationMs}`
            );
          },
        })
      )
    : pino(loggerOptions);
}

export type PinoLogger = ReturnType<typeof createPinoLogger>;

let defaultLogger: PinoLogger | undefined;

export function getDefaultPinoLogger() {
  defaultLogger ??= createPinoLogger();
  return defaultLogger;
}

export const logger = new Proxy({} as PinoLogger, {
  get(_target, prop) {
    const instance = getDefaultPinoLogger();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
