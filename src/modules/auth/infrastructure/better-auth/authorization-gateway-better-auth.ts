import type { AuthorizationGateway } from '../../application/ports/authorization-gateway';
import type { Auth } from './auth';
import { getDefaultAuth } from './auth';

export class AuthorizationGatewayBetterAuth implements AuthorizationGateway {
  constructor(private readonly auth: Auth = getDefaultAuth()) {}

  async userHasPermission(
    input: Parameters<AuthorizationGateway['userHasPermission']>[0]
  ): Promise<boolean> {
    const result = await this.auth.api.userHasPermission({
      body: {
        userId: input.userId,
        permissions: input.permissions,
      },
      headers: input.headers,
    });
    return result.error ? false : result.success;
  }
}
