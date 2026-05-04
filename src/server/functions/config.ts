import { createServerFn } from '@tanstack/react-start';

import { handlers } from '@/server/functions/config.handlers.server';

export const configEnv = createServerFn({ method: 'GET' }).handler(() =>
  handlers.env()
);

export const configDevtools = createServerFn({ method: 'GET' }).handler(() =>
  handlers.devtools()
);
