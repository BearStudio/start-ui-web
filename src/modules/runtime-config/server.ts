import { createServerOnlyFn } from '@tanstack/react-start';

import { createConfigHandlers } from './transport/http/config-handlers';
import { createConfigServerFunctions } from './transport/tanstack/config-server-functions';

const getDeps = createServerOnlyFn(async () => {
  const { getRuntimeConfigUseCases } =
    await import('@/composition/runtime-config');

  return {
    handlers: createConfigHandlers({
      getUseCases: getRuntimeConfigUseCases,
    }),
  };
});

const serverFunctions = createConfigServerFunctions({ getDeps });

export const configEnv = serverFunctions.configEnv;
export type { ConfigServerFunctions } from './transport/tanstack/config-server-functions';
