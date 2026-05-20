import type { UserId } from '@/modules/kernel/domain/ids';

import type { UserRole } from './user';

export function canChangeRole(input: {
  currentUserId: UserId;
  targetUserId: UserId;
  nextRole?: UserRole;
  currentRole: UserRole;
}) {
  return (
    input.currentUserId !== input.targetUserId &&
    input.nextRole !== undefined &&
    input.nextRole !== input.currentRole
  );
}

export function isSelfTarget(currentUserId: UserId, targetUserId: UserId) {
  return currentUserId === targetUserId;
}
