import { and, eq } from 'drizzle-orm';

import {
  getDefaultDbClient,
  type Database,
} from '@/modules/kernel/infrastructure/db/client';

import type { Auth } from './auth';
import { getDefaultAuth } from './auth';
import { session as sessionTable } from '../drizzle/schema';
import type { UserAdminGateway } from '../../application/ports/user-admin-gateway';

export class UserAdminGatewayBetterAuth implements UserAdminGateway {
  constructor(
    private readonly auth: Auth = getDefaultAuth(),
    private readonly db: Database = getDefaultDbClient()
  ) {}

  async removeUser(
    input: Parameters<UserAdminGateway['removeUser']>[0]
  ): Promise<boolean> {
    const response = await this.auth.api.removeUser({
      body: { userId: input.userId },
      headers: input.headers,
    });
    return response.success;
  }

  async revokeUserSessions(
    input: Parameters<UserAdminGateway['revokeUserSessions']>[0]
  ): Promise<boolean> {
    const response = await this.auth.api.revokeUserSessions({
      body: { userId: input.userId },
      headers: input.headers,
    });
    return response.success;
  }

  async revokeUserSession(
    input: Parameters<UserAdminGateway['revokeUserSession']>[0]
  ): Promise<boolean> {
    const session = await this.db.query.session.findFirst({
      where: and(
        eq(sessionTable.id, input.sessionId),
        eq(sessionTable.userId, input.userId)
      ),
      columns: { token: true },
    });
    if (!session) return false;

    const response = await this.auth.api.revokeUserSession({
      body: { sessionToken: session.token },
      headers: input.headers,
    });
    return response.success;
  }
}
