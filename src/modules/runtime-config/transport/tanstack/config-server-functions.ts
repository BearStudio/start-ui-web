import { createServerFn } from '@tanstack/react-start';

import { handlers } from '../http/config-handlers';

export const configEnv = createServerFn({ method: 'GET' }).handler(() =>
  handlers.env()
);
