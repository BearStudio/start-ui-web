import { black, blue, cyan, gray, green, magenta } from 'colorette';
import pino from 'pino';
import pretty from 'pino-pretty';
import { z } from 'zod';

import { env } from '@/env.mjs';

const options: pino.LoggerOptions = { level: env.LOGGER_LEVEL };

export const logger = env.LOGGER_PRETTY
  ? pino(
      options,
      pretty({
        ignore:
          'scope,type,path,pid,hostname,requestId,durationMs,userId,apiType',
        messageFormat: (log, messageKey) => {
          const {
            requestId,
            scope,
            type,
            path,
            durationMs,
            message,
            userId,
            apiType,
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
              apiType: z
                .enum(['REST', 'TRPC'])
                .optional()
                .catch(undefined)
                .transform((v) => (v ? gray(`[${v}] `) : '')),
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
            })
            .parse({ ...log, message: log[messageKey] });

          return black(
            `${apiType}${userId}${requestId}${type}${path}· ${message}${scope}${durationMs}`
          );
        },
      })
    )
  : pino(options);
