import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { ApplicationResult } from '@/modules/kernel/application/result';

import type { Permission } from '../domain/permissions';
import type { RequestScope } from '../domain/request-scope';

export const scopeUserId = (scope: RequestScope) => scope.userId;

export const hasScopePermission = async (input: {
  permissionChecker: PermissionChecker;
  scope: RequestScope;
  permissions: Permission;
}): Promise<
  ApplicationResult<
    { type: 'permission_granted' } | { type: 'permission_denied' }
  >
> => {
  return input.permissionChecker.hasPermission(
    scopeUserId(input.scope),
    input.permissions
  );
};
