import { z } from 'zod';

import { envSchema } from '@/../.env.validator';

declare global {
  // By default, we do not want any namespace in Start UI [web] as it is more
  // error prone and not useful in front end applications.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
