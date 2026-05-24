import { createServerFn } from '@tanstack/react-start';

import type { ConfigHandlers } from '../http/config-handlers';

type ConfigServerFunctionDeps = {
  getDeps: () => Promise<ConfigServerRuntimeDeps> | ConfigServerRuntimeDeps;
};

type ConfigServerRuntimeDeps = {
  handlers: ConfigHandlers;
};

export const createConfigServerFunctions = ({
  getDeps,
}: ConfigServerFunctionDeps) => ({
  configEnv: createServerFn({ method: 'GET' }).handler(async () => {
    const { handlers } = await getDeps();
    return handlers.env();
  }),
});

export type ConfigServerFunctions = ReturnType<
  typeof createConfigServerFunctions
>;
