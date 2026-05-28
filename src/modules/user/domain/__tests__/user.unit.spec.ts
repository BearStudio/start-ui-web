import { describe, expect, it } from 'vitest';

import { toEmailAddress, toUserId } from '@/modules/kernel/domain/ids';

import { shouldUnverifyEmail } from '../user';
import { canChangeRole, isSelfTarget } from '../user-policy';

describe('user domain', () => {
  it('unverifies users only when their email changes', () => {
    expect(
      shouldUnverifyEmail(
        toEmailAddress('old@example.com'),
        toEmailAddress('new@example.com')
      )
    ).toBe(true);

    expect(
      shouldUnverifyEmail(
        toEmailAddress('same@example.com'),
        toEmailAddress('same@example.com')
      )
    ).toBe(false);
  });

  it('detects self-target operations', () => {
    expect(isSelfTarget(toUserId('user-1'), toUserId('user-1'))).toBe(true);
    expect(isSelfTarget(toUserId('user-1'), toUserId('user-2'))).toBe(false);
  });

  it('allows role changes only for other users with a different requested role', () => {
    expect(
      canChangeRole({
        currentUserId: toUserId('admin-1'),
        userId: toUserId('user-1'),
        nextRole: 'admin',
        currentRole: 'user',
      })
    ).toBe(true);

    expect(
      canChangeRole({
        currentUserId: toUserId('user-1'),
        userId: toUserId('user-1'),
        nextRole: 'admin',
        currentRole: 'user',
      })
    ).toBe(false);
    expect(
      canChangeRole({
        currentUserId: toUserId('admin-1'),
        userId: toUserId('user-1'),
        nextRole: undefined,
        currentRole: 'user',
      })
    ).toBe(false);
    expect(
      canChangeRole({
        currentUserId: toUserId('admin-1'),
        userId: toUserId('user-1'),
        nextRole: 'user',
        currentRole: 'user',
      })
    ).toBe(false);
  });
});
