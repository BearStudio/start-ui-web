import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';

import { sanitizeCurrentSession } from './domain/request-scope';

const getCurrentSessionDeps = createServerOnlyFn(async () => {
  const [
    { getAuthUseCases },
    { createServerContextTools },
    { telemetryProxy },
  ] = await Promise.all([
    import('@/composition/auth'),
    import('./transport/tanstack/server-context'),
    import('@/composition/telemetry'),
  ]);

  return {
    serverContextTools: createServerContextTools({
      getAuthUseCases,
      telemetry: telemetryProxy,
    }),
  };
});

export const currentSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { serverContextTools } = await getCurrentSessionDeps();

    return serverContextTools.withPublicContext(async (ctx) =>
      sanitizeCurrentSession(
        ctx.user && ctx.session
          ? { user: ctx.user, session: ctx.session }
          : null
      )
    );
  }
);

export const authServerFunctions = {
  currentSession,
};
