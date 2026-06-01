import type { UserId } from '@/modules/kernel/domain/ids';

import type {
  AuthRemoveUserOutcome,
  AuthResult,
  AuthUseCaseDeps,
} from './types';

export async function removeUser(
  deps: AuthUseCaseDeps,
  input: { userId: UserId; headers: Headers }
): Promise<AuthResult<AuthRemoveUserOutcome>> {
  return deps.userAdminGateway.removeUser(input);
}
