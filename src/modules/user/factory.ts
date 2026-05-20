import { createUser } from './application/use-cases/create-user';
import { deleteUser } from './application/use-cases/delete-user';
import { getUser } from './application/use-cases/get-user';
import { listUserSessions } from './application/use-cases/list-user-sessions';
import { listUsers } from './application/use-cases/list-users';
import { revokeUserSession } from './application/use-cases/revoke-user-session';
import { revokeUserSessions } from './application/use-cases/revoke-user-sessions';
import type { UserUseCaseDeps } from './application/use-cases/types';
import { updateUser } from './application/use-cases/update-user';

export function createUserUseCases(deps: UserUseCaseDeps) {
  return {
    list: (input: Parameters<typeof listUsers>[1]) => listUsers(deps, input),
    get: (input: Parameters<typeof getUser>[1]) => getUser(deps, input),
    create: (input: Parameters<typeof createUser>[1]) =>
      createUser(deps, input),
    update: (input: Parameters<typeof updateUser>[1]) =>
      updateUser(deps, input),
    delete: (input: Parameters<typeof deleteUser>[1]) =>
      deleteUser(deps, input),
    listSessions: (input: Parameters<typeof listUserSessions>[1]) =>
      listUserSessions(deps, input),
    revokeSessions: (input: Parameters<typeof revokeUserSessions>[1]) =>
      revokeUserSessions(deps, input),
    revokeSession: (input: Parameters<typeof revokeUserSession>[1]) =>
      revokeUserSession(deps, input),
  };
}

export type UserUseCases = ReturnType<typeof createUserUseCases>;
