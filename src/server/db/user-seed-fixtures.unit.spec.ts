import { describe, expect, it } from 'vitest';

import {
  canonicalUsers,
  getCanonicalUserRepairData,
} from '../../../prisma/seed/user-fixtures';

describe('getCanonicalUserRepairData', () => {
  const adminFixture = canonicalUsers.find((user) => user.role === 'admin');

  it('returns no changes for an already canonical fixture state', () => {
    expect(adminFixture).toBeDefined();

    expect(
      getCanonicalUserRepairData(
        {
          role: 'admin',
          emailVerified: true,
          onboardedAt: new Date('2026-04-19T00:00:00.000Z'),
        },
        adminFixture!
      )
    ).toEqual({});
  });

  it('repairs role, verification, and onboarding drift for canonical users', () => {
    const now = new Date('2026-04-19T12:00:00.000Z');
    expect(adminFixture).toBeDefined();

    expect(
      getCanonicalUserRepairData(
        {
          role: 'user',
          emailVerified: false,
          onboardedAt: null,
        },
        adminFixture!,
        now
      )
    ).toEqual({
      role: 'admin',
      emailVerified: true,
      onboardedAt: now,
    });
  });
});
