import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { ApplicationResult } from '@/modules/kernel/application/result';

import type { UserAuthGateway } from '../ports/user-auth-gateway';
import type {
  UserCreateRepositoryOutcome,
  UserGetRepositoryOutcome,
  UserListRepositoryOutcome,
  UserRepository,
  UserSessionRevocationTargetRepositoryOutcome,
  UserSessionsListRepositoryOutcome,
  UserUpdateRepositoryOutcome,
} from '../ports/user-repository';

export type UserUseCaseDeps = {
  userRepository: UserRepository;
  userAuthGateway: UserAuthGateway;
  permissionChecker: PermissionChecker;
  logger: Logger;
};

export type UserForbiddenOutcome = { type: 'user_forbidden' };
export type UserSelfOutcome = { type: 'user_self' };

export type UserListOutcome = UserListRepositoryOutcome | UserForbiddenOutcome;

export type UserGetOutcome = UserGetRepositoryOutcome | UserForbiddenOutcome;

export type UserCreateOutcome =
  | UserCreateRepositoryOutcome
  | UserForbiddenOutcome;

export type UserUpdateOutcome =
  | UserUpdateRepositoryOutcome
  | UserForbiddenOutcome;

export type UserDeleteOutcome =
  | { type: 'user_deleted' }
  | UserForbiddenOutcome
  | UserSelfOutcome;

export type UserSessionsListOutcome =
  | UserSessionsListRepositoryOutcome
  | UserForbiddenOutcome;

export type UserRevokeSessionsOutcome =
  | { type: 'user_sessions_revoked' }
  | UserForbiddenOutcome
  | UserSelfOutcome;

export type UserRevokeSessionOutcome =
  | { type: 'user_session_revoked' }
  | Extract<
      UserSessionRevocationTargetRepositoryOutcome,
      { type: 'user_session_not_found' }
    >
  | UserForbiddenOutcome
  | UserSelfOutcome;

export type UserResult<TOutcome> = ApplicationResult<TOutcome>;
