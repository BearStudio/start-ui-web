import type { Auth } from './auth';
import { getDefaultAuth } from './auth';
import type { UserAdminGateway } from '../../application/ports/user-admin-gateway';

export class UserAdminGatewayBetterAuth implements UserAdminGateway {
  constructor(private readonly auth: Auth = getDefaultAuth()) {}

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
    const response = await this.auth.api.revokeUserSession({
      body: { sessionToken: input.providerToken },
      headers: input.headers,
    });
    return response.success;
  }
}
