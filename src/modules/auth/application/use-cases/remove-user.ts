import type { UserId } from '@/modules/kernel/domain/ids';

import type { AuthUseCaseDeps } from './types';

export async function removeUser(
  deps: AuthUseCaseDeps,
  input: { userId: UserId; headers: Headers }
): Promise<boolean> {
  return deps.userAdminGateway.removeUser(input);
}
