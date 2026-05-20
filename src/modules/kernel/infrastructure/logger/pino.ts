import { black, blue, cyan, gray, green, magenta, red } from 'colorette';
import pino from 'pino';
import pretty from 'pino-pretty';
import { z } from 'zod';

import { env } from '@/modules/kernel/infrastructure/config/env';

const options: pino.LoggerOptions = { level: env.LOGGER_LEVEL };

export const logger = env.LOGGER_PRETTY
  ? pino(
      options,
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
  : pino(options);
