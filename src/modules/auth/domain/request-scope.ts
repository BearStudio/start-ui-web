import type { ScopeKey, UserId } from '@/modules/kernel/domain/ids';
import { toScopeKey } from '@/modules/kernel/domain/ids';

import type { Role } from './permissions';
import type { AuthenticatedUser, AuthSession } from './session';

export type RequestScope = {
  userId: UserId;
  role: Role;
};

export type CurrentSession = {
  user: Pick<
    AuthenticatedUser,
    'id' | 'email' | 'name' | 'image' | 'emailVerified' | 'role' | 'onboardedAt'
  >;
  session: Pick<AuthSession['session'], 'id' | 'expiresAt'>;
  scope: RequestScope;
  scopeKey: ScopeKey;
};

export const scopeFromUser = (
  user: Pick<AuthenticatedUser, 'id' | 'role'>
): RequestScope => ({
  userId: user.id,
  role: user.role,
});

export const scopeKeyFromScope = (scope: RequestScope) =>
  toScopeKey(`user:${scope.userId}:role:${scope.role}`);

export const scopeKeyFromSession = (
  session: Pick<AuthSession, 'user'> | CurrentSession | null | undefined
) => {
  if (!session?.user) return toScopeKey('anonymous');
  return scopeKeyFromScope(scopeFromUser(session.user));
};

export const sanitizeCurrentSession = (
  authSession: AuthSession | null
): CurrentSession | null => {
  if (!authSession) return null;

  const scope = scopeFromUser(authSession.user);

  return {
    user: {
      id: authSession.user.id,
      email: authSession.user.email,
      name: authSession.user.name,
      image: authSession.user.image,
      emailVerified: authSession.user.emailVerified,
      role: authSession.user.role,
      onboardedAt: authSession.user.onboardedAt,
    },
    session: {
      id: authSession.session.id,
      expiresAt: authSession.session.expiresAt,
    },
    scope,
    scopeKey: scopeKeyFromScope(scope),
  };
};
