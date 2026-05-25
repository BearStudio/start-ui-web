import type { Role } from './permissions';
import type { AuthenticatedUser, AuthSession } from './session';

export type RequestScope = {
  userId: string;
  role: Role;
  tenantId: null;
};

export type CurrentSession = {
  user: Pick<
    AuthenticatedUser,
    'id' | 'email' | 'name' | 'image' | 'role' | 'onboardedAt'
  >;
  session: Pick<AuthSession['session'], 'id' | 'expiresAt'>;
  scope: RequestScope;
  scopeKey: string;
};

export const scopeFromUser = (
  user: Pick<AuthenticatedUser, 'id' | 'role'>
): RequestScope => ({
  userId: user.id,
  role: user.role,
  tenantId: null,
});

export const scopeKeyFromScope = (scope: RequestScope) =>
  `user:${scope.userId}:role:${scope.role}:tenant:${scope.tenantId ?? 'none'}`;

export const scopeKeyFromSession = (
  session: Pick<AuthSession, 'user'> | CurrentSession | null | undefined
) => {
  if (!session?.user) return 'anonymous';
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
