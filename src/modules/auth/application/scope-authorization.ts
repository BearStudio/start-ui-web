import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { Permission } from '../domain/permissions';
import type { RequestScope } from '../domain/request-scope';

export const scopeUserId = (scope: RequestScope) => toUserId(scope.userId);

export const hasScopePermission = async (input: {
  permissionChecker: PermissionChecker;
  scope: RequestScope;
  permissions: Permission;
}) => {
  return input.permissionChecker.hasPermission(
    scopeUserId(input.scope),
    input.permissions
  );
};
