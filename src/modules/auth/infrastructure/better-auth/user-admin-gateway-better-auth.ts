import { Result } from '@swan-io/boxed';
import { and, eq } from 'drizzle-orm';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import {
  getDefaultDbClient,
  type Database,
} from '@/modules/kernel/infrastructure/db/client';

import type { Auth } from './auth';
import { getDefaultAuth } from './auth';
import { authIdentity, session as sessionTable } from '../drizzle/schema';
import type { UserAdminGateway } from '../../application/ports/user-admin-gateway';

export class UserAdminGatewayBetterAuth implements UserAdminGateway {
  constructor(
    private readonly auth: Auth = getDefaultAuth(),
    private readonly db: Database = getDefaultDbClient()
  ) {}

  async removeUser(
    input: Parameters<UserAdminGateway['removeUser']>[0]
  ): ReturnType<UserAdminGateway['removeUser']> {
    try {
      const response = await this.auth.api.removeUser({
        body: { userId: input.userId },
        headers: input.headers,
      });
      if (!response.success) {
        return Result.Error(
          new AppError({
            code: 'AUTH_USER_REMOVE_FAILED',
            category: 'system',
            status: 500,
            message: 'Failed to remove auth user',
          })
        );
      }
      return Result.Ok({ type: 'auth_user_removed' });
    } catch (error) {
      return Result.Error(
        new AppError({
          code: 'AUTH_USER_REMOVE_FAILED',
          category: 'system',
          status: 500,
          message: 'Failed to remove auth user',
          cause: error,
        })
      );
    }
  }

  async revokeUserSessions(
    input: Parameters<UserAdminGateway['revokeUserSessions']>[0]
  ): ReturnType<UserAdminGateway['revokeUserSessions']> {
    try {
      const response = await this.auth.api.revokeUserSessions({
        body: { userId: input.userId },
        headers: input.headers,
      });
      if (!response.success) {
        return Result.Error(
          new AppError({
            code: 'AUTH_USER_SESSIONS_REVOKE_FAILED',
            category: 'system',
            status: 500,
            message: 'Failed to revoke auth user sessions',
          })
        );
      }
      return Result.Ok({ type: 'auth_user_sessions_revoked' });
    } catch (error) {
      return Result.Error(
        new AppError({
          code: 'AUTH_USER_SESSIONS_REVOKE_FAILED',
          category: 'system',
          status: 500,
          message: 'Failed to revoke auth user sessions',
          cause: error,
        })
      );
    }
  }

  async revokeUserSession(
    input: Parameters<UserAdminGateway['revokeUserSession']>[0]
  ): ReturnType<UserAdminGateway['revokeUserSession']> {
    try {
      const session = await this.db.query.session.findFirst({
        where: eq(sessionTable.id, input.sessionId),
        columns: { token: true, userId: true },
      });
      if (!session) {
        return Result.Error(
          new AppError({
            code: 'AUTH_USER_SESSION_TOKEN_NOT_FOUND',
            category: 'not_found',
            status: 404,
            message: 'Auth user session token was not found',
          })
        );
      }

      const identity = await this.db.query.authIdentity.findFirst({
        where: and(
          eq(authIdentity.provider, 'better-auth'),
          eq(authIdentity.providerUserId, session.userId)
        ),
        columns: { userId: true },
      });
      const appUserId = identity?.userId ?? session.userId;
      if (appUserId !== input.userId) {
        return Result.Error(
          new AppError({
            code: 'AUTH_USER_SESSION_OWNER_MISMATCH',
            category: 'forbidden',
            status: 403,
            message: 'Auth user session owner did not match',
          })
        );
      }

      const response = await this.auth.api.revokeUserSession({
        body: { sessionToken: session.token },
        headers: input.headers,
      });
      if (!response.success) {
        return Result.Error(
          new AppError({
            code: 'AUTH_USER_SESSION_REVOKE_FAILED',
            category: 'system',
            status: 500,
            message: 'Failed to revoke auth user session',
          })
        );
      }
      return Result.Ok({ type: 'auth_user_session_revoked' });
    } catch (error) {
      return Result.Error(
        new AppError({
          code: 'AUTH_USER_SESSION_REVOKE_FAILED',
          category: 'system',
          status: 500,
          message: 'Failed to revoke auth user session',
          cause: error,
        })
      );
    }
  }
}
