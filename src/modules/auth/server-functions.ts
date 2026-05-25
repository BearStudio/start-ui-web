import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';

import { sanitizeCurrentSession } from './domain/request-scope';

const getCurrentSessionDeps = createServerOnlyFn(async () => {
  const [{ getAuthUseCases }, { createServerContextTools }] = await Promise.all(
    [
      import('@/composition/auth'),
      import('./transport/tanstack/server-context'),
    ]
  );

  return {
    serverContextTools: createServerContextTools({ getAuthUseCases }),
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
