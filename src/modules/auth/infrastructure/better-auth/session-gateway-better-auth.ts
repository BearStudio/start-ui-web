import type { Auth } from './auth';
import { getDefaultAuth } from './auth';
import type { SessionGateway } from '../../application/ports/session-gateway';
import type {
  AuthenticatedSession,
  AuthenticatedUser,
  AuthSession,
} from '../../domain/session';

type BetterAuthSession = NonNullable<
  Awaited<ReturnType<Auth['api']['getSession']>>
>;
type BetterAuthUser = BetterAuthSession['user'];
type BetterAuthSessionRecord = BetterAuthSession['session'];

const toAuthenticatedUser = (user: BetterAuthUser): AuthenticatedUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  image: user.image,
  emailVerified: user.emailVerified,
  role: user.role as AuthenticatedUser['role'],
  onboardedAt: user.onboardedAt,
});

const toAuthenticatedSession = (
  session: BetterAuthSessionRecord
): AuthenticatedSession => ({
  id: session.id,
  userId: session.userId,
  expiresAt: session.expiresAt,
});

export class SessionGatewayBetterAuth implements SessionGateway {
  constructor(private readonly auth: Auth = getDefaultAuth()) {}

  async getSession(input: { headers: Headers }): Promise<AuthSession | null> {
    const session = await this.auth.api.getSession({
      headers: input.headers,
    });
    if (!session?.user || !session.session) return null;
    return {
      user: toAuthenticatedUser(session.user),
      session: toAuthenticatedSession(session.session),
    };
  }
}
