import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';

import { getTelemetry } from '@/platform/telemetry';

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
  return getTelemetry().startSpan(
    {
      attributes: {
        'operation.name': 'config.env',
        'operation.type': 'server_function',
      },
      name: 'config.env',
      op: 'server.function',
    },
    () => handlers.env()
  );
});

export type ConfigServerFunctions = {
  configEnv: typeof configEnv;
};
