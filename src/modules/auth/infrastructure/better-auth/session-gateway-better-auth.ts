import { Result } from '@swan-io/boxed';
import { and, eq } from 'drizzle-orm';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import {
  type Database,
  getDefaultDbClient,
} from '@/modules/kernel/infrastructure/db/client';
import { getTelemetry } from '@/platform/telemetry';

import type { Auth } from './auth';
import { getDefaultAuth } from './auth';
import { authIdentity, user as userTable } from '../drizzle/schema';
import type { SessionGateway } from '../../application/ports/session-gateway';
import { zRole } from '../../domain/permissions';
import type {
  AuthenticatedSession,
  AuthenticatedUser,
} from '../../domain/session';

type BetterAuthSession = NonNullable<
  Awaited<ReturnType<Auth['api']['getSession']>>
>;
type BetterAuthSessionRecord = BetterAuthSession['session'];

const authenticatedRole = zRole();
const defaultAuthenticatedRole = 'user' satisfies AuthenticatedUser['role'];

type AuthenticatedUserSource = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
  role?: unknown;
  onboardedAt?: Date | string | null;
};

const toAuthenticatedRole = (role: unknown): AuthenticatedUser['role'] => {
  const parsed = authenticatedRole.safeParse(role);
  return parsed.success ? parsed.data : defaultAuthenticatedRole;
};

const toAuthenticatedUser = (
  user: AuthenticatedUserSource
): AuthenticatedUser => ({
  id: toUserId(user.id),
  email: toEmailAddress(user.email),
  name: user.name,
  image: user.image,
  emailVerified: user.emailVerified,
  role: toAuthenticatedRole(user.role),
  onboardedAt: user.onboardedAt,
});

const toAuthenticatedSession = (
  session: BetterAuthSessionRecord,
  userId?: string
): AuthenticatedSession => ({
  id: toSessionId(session.id),
  userId: userId ? toUserId(userId) : undefined,
  expiresAt: session.expiresAt,
});

export class SessionGatewayBetterAuth implements SessionGateway {
  constructor(
    private readonly auth: Auth = getDefaultAuth(),
    private readonly db: Database = getDefaultDbClient()
  ) {}

  private async resolveAppUser(
    providerUser: AuthenticatedUserSource
  ): Promise<AuthenticatedUserSource | null> {
    const identity = await this.db.query.authIdentity.findFirst({
      where: and(
        eq(authIdentity.provider, 'better-auth'),
        eq(authIdentity.providerUserId, providerUser.id)
      ),
      columns: { userId: true },
    });
    const userId = identity?.userId ?? providerUser.id;
    if (!identity) {
      await this.db
        .insert(authIdentity)
        .values({
          provider: 'better-auth',
          providerUserId: providerUser.id,
          userId: providerUser.id,
        })
        .onConflictDoNothing();
    }
    if (userId === providerUser.id) return providerUser;

    const appUser = await this.db.query.user.findFirst({
      where: eq(userTable.id, userId),
    });

    return appUser ?? null;
  }

  async getSession(input: {
    headers: Headers;
  }): ReturnType<SessionGateway['getSession']> {
    return getTelemetry().startSpan(
      {
        attributes: {
          'auth.provider': 'better-auth',
          'operation.name': 'auth.getSession',
          'operation.type': 'provider_operation',
        },
        name: 'auth.getSession',
        op: 'auth.provider',
      },
      async () => {
        try {
          const session = await this.auth.api.getSession({
            headers: input.headers,
          });
          if (!session?.user || !session.session) {
            return Result.Ok({ type: 'auth_session_missing' });
          }
          const user = await this.resolveAppUser(session.user);
          if (!user) return Result.Ok({ type: 'auth_session_missing' });
          return Result.Ok({
            type: 'auth_session_found',
            session: {
              user: toAuthenticatedUser(user),
              session: toAuthenticatedSession(session.session, user.id),
            },
          });
        } catch (error) {
          return Result.Error(
            error instanceof AppError
              ? error
              : new AppError({
                  code: 'AUTH_SESSION_GATEWAY_ERROR',
                  category: 'system',
                  status: 500,
                  message: 'Auth session gateway error',
                  cause: error,
                })
          );
        }
      }
    );
  }
}
