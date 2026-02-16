import { z } from 'zod';

import { envClient } from '@/env/client';
import { publicProcedure } from '@/server/orpc';

const tags = ['config'];

export default {
  env: publicProcedure()
    .route({ method: 'GET', path: '/config/env', tags })
    .output(
      z.object({
        name: z.string().optional(),
        color: z.string(),
        emoji: z.string().optional(),
        isDemo: z.boolean(),
        isDev: z.boolean(),
      })
    )
    .handler(() => {
      return {
        name: envClient.VITE_ENV_NAME,
        color: envClient.VITE_ENV_COLOR,
        emoji: envClient.VITE_ENV_EMOJI,
        isDemo: envClient.VITE_IS_DEMO,
        isDev: import.meta.env.DEV,
      };
    }),
  devtools: publicProcedure()
    .route({ method: 'GET', path: '/config/devtools', tags })
    .output(
      z.object({
        maildevIframeSrc: z.string().nullish(),
      })
    )
    .handler(() => {
      return {
        maildevIframeSrc:
          // eslint-disable-next-line no-process-env
          import.meta.env.DEV && process.env.DOCKER_MAILDEV_UI_PORT
            ? // eslint-disable-next-line no-process-env
              `http://localhost:${process.env.DOCKER_MAILDEV_UI_PORT}/#/`
            : null,
      };
    }),
};
