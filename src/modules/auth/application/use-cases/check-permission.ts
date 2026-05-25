import type { AuthUseCaseDeps } from './types';
import type { AuthorizationPermission } from '../ports/authorization-gateway';

export async function checkPermission(
  deps: AuthUseCaseDeps,
  input: {
    userId: string;
    permissions: AuthorizationPermission;
    headers: Headers;
  }
): Promise<boolean> {
  return deps.authorizationGateway.userHasPermission(input);
}
