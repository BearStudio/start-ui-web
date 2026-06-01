import type { ApplicationResult } from '@/modules/kernel/application/result';
import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

import type {
  SessionRevocationTarget,
  User,
  UserCreateInput,
  UserListPage,
  UserSessionListPage,
  UserUpdateInput,
  UserUpdatePersistenceInput,
  UserUpdateSnapshot,
} from '../../domain/user';

export type UserListRepositoryOutcome = {
  type: 'user_listed';
  page: UserListPage;
};

export type UserGetRepositoryOutcome =
  | { type: 'user_found'; user: User }
  | { type: 'user_not_found' };

export type UserCreateRepositoryOutcome =
  | { type: 'user_created'; user: User }
  | { type: 'user_duplicate' };

export type UserUpdateSnapshotRepositoryOutcome =
  | { type: 'user_update_snapshot_found'; snapshot: UserUpdateSnapshot }
  | { type: 'user_not_found' };

export type UserUpdateRepositoryOutcome =
  | { type: 'user_updated'; user: User }
  | { type: 'user_not_found' }
  | { type: 'user_duplicate' };

export type UserSessionsListRepositoryOutcome = {
  type: 'user_sessions_listed';
  page: UserSessionListPage;
};

export type UserSessionRevocationTargetRepositoryOutcome =
  | {
      type: 'user_session_revocation_target_found';
      target: SessionRevocationTarget;
    }
  | { type: 'user_session_not_found' };

export interface UserRepository {
  list(input: {
    cursor?: UserId;
    limit: number;
    searchTerm: string;
  }): Promise<ApplicationResult<UserListRepositoryOutcome>>;
  getById(id: UserId): Promise<ApplicationResult<UserGetRepositoryOutcome>>;
  create(
    input: UserCreateInput
  ): Promise<ApplicationResult<UserCreateRepositoryOutcome>>;
  getUpdateSnapshot(
    id: UserId
  ): Promise<ApplicationResult<UserUpdateSnapshotRepositoryOutcome>>;
  update(
    id: UserId,
    input: UserUpdatePersistenceInput
  ): Promise<ApplicationResult<UserUpdateRepositoryOutcome>>;
  listSessions(input: {
    userId: UserId;
    cursor?: SessionId;
    limit: number;
  }): Promise<ApplicationResult<UserSessionsListRepositoryOutcome>>;
  findSessionForRevocation(input: {
    userId: UserId;
    sessionId: SessionId;
  }): Promise<ApplicationResult<UserSessionRevocationTargetRepositoryOutcome>>;
}

export type { UserUpdateInput };
