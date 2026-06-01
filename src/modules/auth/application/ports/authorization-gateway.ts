import type { PermissionRequest } from '@/modules/kernel/application/ports/permission-checker';
import type { ApplicationResult } from '@/modules/kernel/application/result';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { Permission } from '../../domain/permissions';

export type AuthorizationPermission = Permission | PermissionRequest;

export type AuthorizationGatewayOutcome =
  | { type: 'auth_permission_granted' }
  | { type: 'auth_permission_denied' };

export interface AuthorizationGateway {
  userHasPermission(input: {
    userId: UserId;
    permissions: AuthorizationPermission;
    headers: Headers;
  }): Promise<ApplicationResult<AuthorizationGatewayOutcome>>;
}
