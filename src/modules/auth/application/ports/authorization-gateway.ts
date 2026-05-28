import type { PermissionRequest } from '@/modules/kernel/application/ports/permission-checker';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { Permission } from '../../domain/permissions';

export type AuthorizationPermission = Permission | PermissionRequest;

export interface AuthorizationGateway {
  userHasPermission(input: {
    userId: UserId;
    permissions: AuthorizationPermission;
    headers: Headers;
  }): Promise<boolean>;
}
