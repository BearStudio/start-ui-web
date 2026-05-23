import type { UserId } from '@/modules/kernel/domain/ids';

import type { SessionRevocationTarget } from '../../domain/user';

export interface UserAuthGateway {
  removeUser(userId: UserId): Promise<boolean>;
  revokeUserSessions(userId: UserId): Promise<boolean>;
  revokeUserSession(target: SessionRevocationTarget): Promise<boolean>;
}
