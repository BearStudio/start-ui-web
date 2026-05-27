import type { PublicContext } from './server-context';
import { sanitizeCurrentSession } from '../../domain/request-scope';

export const createAuthHandlers = () => {
  const currentSession = (ctx: PublicContext) =>
    sanitizeCurrentSession(
      ctx.user && ctx.session ? { user: ctx.user, session: ctx.session } : null
    );

  return {
    currentSession,
  };
};

export type AuthHandlers = ReturnType<typeof createAuthHandlers>;
