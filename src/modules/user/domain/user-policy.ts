import type { UserId } from '@/modules/kernel/domain/ids';

import type { UserRole } from './user';

export function canChangeRole(input: {
  currentUserId: UserId;
  userId: UserId;
  nextRole?: UserRole;
  currentRole: UserRole;
}) {
  return (
    input.currentUserId !== input.userId &&
    input.nextRole !== undefined &&
    input.nextRole !== input.currentRole
  );
}

export function isSelfTarget(currentUserId: UserId, userId: UserId) {
  return currentUserId === userId;
}
