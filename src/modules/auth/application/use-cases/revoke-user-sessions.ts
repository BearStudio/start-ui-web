import type { UserId } from '@/modules/kernel/domain/ids';

import type {
  AuthResult,
  AuthRevokeUserSessionsOutcome,
  AuthUseCaseDeps,
} from './types';

export async function revokeUserSessions(
  deps: AuthUseCaseDeps,
  input: { userId: UserId; headers: Headers }
): Promise<AuthResult<AuthRevokeUserSessionsOutcome>> {
  return deps.userAdminGateway.revokeUserSessions(input);
}
