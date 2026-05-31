import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';

import {
  type ConfigHandlers,
  createConfigHandlers,
} from './transport/http/config-handlers';

type ConfigServerRuntimeDeps = {
  handlers: ConfigHandlers;
};

const getDeps = createServerOnlyFn(
  async (): Promise<ConfigServerRuntimeDeps> => {
    const { getRuntimeConfigUseCases } =
      await import('@/platform/runtime-config/service');

    return {
      handlers: createConfigHandlers({
        getUseCases: getRuntimeConfigUseCases,
      }),
    };
  }
);

export const configEnv = createServerFn({ method: 'GET' }).handler(async () => {
  const { handlers } = await getDeps();
  return handlers.env();
});

export type ConfigServerFunctions = {
  configEnv: typeof configEnv;
};
