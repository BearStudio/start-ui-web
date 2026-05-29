import { describe, expect, it } from 'vitest';

import { toEmailAddress, toUserId } from '@/modules/kernel/domain/ids';
import { fc, PROPERTY_DEFAULTS, test } from '@/tests/support/property-testing';

import { shouldUnverifyEmail } from '../user';
import { canChangeRole, isSelfTarget } from '../user-policy';

const localEmailCharacter = fc.constantFrom(
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9'
);
const safeEmail = fc
  .array(localEmailCharacter, { minLength: 1, maxLength: 24 })
  .map((localPart) => toEmailAddress(`${localPart.join('')}@example.com`));
const nonBlankUserId = fc
  .string({ maxLength: 40 })
  .filter((value) => value.trim().length > 0)
  .map(toUserId);
const role = fc.constantFrom('admin' as const, 'user' as const);

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

  test.prop([safeEmail, safeEmail], PROPERTY_DEFAULTS)(
    'unverifies generated email updates exactly when the address changes',
    (currentEmail, nextEmail) => {
      expect(shouldUnverifyEmail(currentEmail, nextEmail)).toBe(
        currentEmail !== nextEmail
      );
    }
  );

  test.prop([nonBlankUserId, nonBlankUserId], PROPERTY_DEFAULTS)(
    'detects generated self-target operations by ID equality',
    (currentUserId, targetUserId) => {
      expect(isSelfTarget(currentUserId, targetUserId)).toBe(
        currentUserId === targetUserId
      );
    }
  );

  test.prop(
    [
      fc.record({
        currentUserId: nonBlankUserId,
        userId: nonBlankUserId,
        nextRole: fc.option(role, { nil: undefined }),
        currentRole: role,
      }),
    ],
    PROPERTY_DEFAULTS
  )(
    'allows generated role changes only for other users and new roles',
    (input) => {
      expect(canChangeRole(input)).toBe(
        input.currentUserId !== input.userId &&
          input.nextRole !== undefined &&
          input.nextRole !== input.currentRole
      );
    }
  );
});
