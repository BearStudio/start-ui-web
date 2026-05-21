import { describe, expect, it } from 'vitest';

import { toEmailAddress, toUserId } from '@/modules/kernel/domain/ids';

import { shouldUnverifyEmail } from '../user';
import { canChangeRole, isSelfTarget } from '../user-policy';

describe('user domain', () => {
  it('detects email verification and self-target policies', () => {
    expect(
      shouldUnverifyEmail(
        toEmailAddress('old@example.com'),
        toEmailAddress('new@example.com')
      )
    ).toBe(true);
    expect(isSelfTarget(toUserId('user-1'), toUserId('user-1'))).toBe(true);
    expect(
      canChangeRole({
        currentUserId: toUserId('admin-1'),
        targetUserId: toUserId('user-1'),
        nextRole: 'admin',
        currentRole: 'user',
      })
    ).toBe(true);
  });
});
