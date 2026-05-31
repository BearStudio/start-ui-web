import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';

import {
  type AuthHandlers,
  createAuthHandlers,
} from '../tanstack/auth-handlers';
import type { ServerContextTools } from '../tanstack/server-context';

type CurrentSessionDeps = {
  handlers: AuthHandlers;
  serverContextTools: ServerContextTools;
};

const getCurrentSessionDeps = createServerOnlyFn(
  async (): Promise<CurrentSessionDeps> => {
    const [
      { getAuthUseCases },
      { createServerContextTools },
      { telemetryProxy },
    ] = await Promise.all([
      import('@/composition/auth'),
      import('../tanstack/server-context'),
      import('@/composition/telemetry'),
    ]);

    return {
      handlers: createAuthHandlers(),
      serverContextTools: createServerContextTools({
        getAuthUseCases,
        telemetry: telemetryProxy,
      }),
    };
  }
);

export const currentSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { handlers, serverContextTools } = await getCurrentSessionDeps();

    return serverContextTools.withPublicContext(async (ctx) =>
      handlers.currentSession(ctx)
    );
  }
);

export const authServerFunctions = {
  currentSession,
};
