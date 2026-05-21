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

export interface UserRepository {
  list(input: {
    cursor?: UserId;
    limit: number;
    searchTerm: string;
  }): Promise<UserListPage>;
  getById(id: UserId): Promise<User | null>;
  create(input: UserCreateInput): Promise<User>;
  getUpdateSnapshot(id: UserId): Promise<UserUpdateSnapshot | null>;
  update(id: UserId, input: UserUpdatePersistenceInput): Promise<User | null>;
  listSessions(input: {
    userId: UserId;
    cursor?: SessionId;
    limit: number;
  }): Promise<UserSessionListPage>;
  findSessionForRevocation(input: {
    userId: UserId;
    sessionId: SessionId;
  }): Promise<SessionRevocationTarget | null>;
}

export type { UserUpdateInput };
