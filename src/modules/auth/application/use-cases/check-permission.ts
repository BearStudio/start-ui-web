import type { UserId } from '@/modules/kernel/domain/ids';

import type {
  AuthPermissionOutcome,
  AuthResult,
  AuthUseCaseDeps,
} from './types';
import type { AuthorizationPermission } from '../ports/authorization-gateway';

export async function checkPermission(
  deps: AuthUseCaseDeps,
  input: {
    userId: UserId;
    permissions: AuthorizationPermission;
    headers: Headers;
  }
): Promise<AuthResult<AuthPermissionOutcome>> {
  return deps.authorizationGateway.userHasPermission(input);
}
