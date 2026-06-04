import { Result } from '@swan-io/boxed';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { getTelemetry } from '@/platform/telemetry';

import type { Auth } from './auth';
import { getDefaultAuth } from './auth';
import type { AuthorizationGateway } from '../../application/ports/authorization-gateway';

export class AuthorizationGatewayBetterAuth implements AuthorizationGateway {
  constructor(private readonly auth: Auth = getDefaultAuth()) {}

  async userHasPermission(
    input: Parameters<AuthorizationGateway['userHasPermission']>[0]
  ): ReturnType<AuthorizationGateway['userHasPermission']> {
    return getTelemetry().startSpan(
      {
        attributes: {
          'auth.provider': 'better-auth',
          'operation.name': 'auth.userHasPermission',
          'operation.type': 'provider_operation',
        },
        name: 'auth.userHasPermission',
        op: 'auth.provider',
      },
      async () => {
        try {
          const result = await this.auth.api.userHasPermission({
            body: {
              userId: input.userId,
              permissions: input.permissions,
            },
            headers: input.headers,
          });
          if (result.error) {
            return Result.Error(
              new AppError({
                code: 'AUTH_PERMISSION_CHECK_FAILED',
                category: 'system',
                status: 500,
                message: 'Failed to check user permission',
                cause: result.error,
              })
            );
          }
          return Result.Ok(
            result.success
              ? { type: 'auth_permission_granted' }
              : { type: 'auth_permission_denied' }
          );
        } catch (error) {
          return Result.Error(
            new AppError({
              code: 'AUTH_PERMISSION_CHECK_FAILED',
              category: 'system',
              status: 500,
              message: 'Failed to check user permission',
              cause: error,
            })
          );
        }
      }
    );
  }
}
