import type { Auth } from './auth';
import type {
  AuthenticatedSession,
  AuthenticatedUser,
  AuthGateway,
} from '../../application/ports/auth-gateway';

const toAuthenticatedUser = (user: ExplicitAny): AuthenticatedUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  image: user.image,
  emailVerified: user.emailVerified,
  role: user.role,
  onboardedAt: user.onboardedAt,
});

const toAuthenticatedSession = (
  session: ExplicitAny
): AuthenticatedSession => ({
  id: session.id,
  userId: session.userId,
  expiresAt: session.expiresAt,
});

export const createBetterAuthGateway = (auth: Auth): AuthGateway => ({
  async getSession(input) {
    const session = await auth.api.getSession({
      headers: input.headers,
    });
    if (!session?.user || !session.session) return null;
    return {
      user: toAuthenticatedUser(session.user),
      session: toAuthenticatedSession(session.session),
    };
  },
  async userHasPermission(input) {
    const result = await auth.api.userHasPermission({
      body: {
        userId: input.userId,
        permissions: input.permissions,
      },
      headers: input.headers,
    });
    return result.error ? false : result.success;
  },
  async removeUser(input) {
    const response = await auth.api.removeUser({
      body: { userId: input.userId },
      headers: input.headers,
    });
    return response.success;
  },
  async revokeUserSessions(input) {
    const response = await auth.api.revokeUserSessions({
      body: { userId: input.userId },
      headers: input.headers,
    });
    return response.success;
  },
  async revokeUserSession(input) {
    if (!input.providerSessionToken) return false;
    const response = await auth.api.revokeUserSession({
      body: { sessionToken: input.providerSessionToken },
      headers: input.headers,
    });
    return response.success;
  },
});
