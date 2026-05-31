import { describe, expect, it, vi } from 'vitest';

import { toUserId } from '@/modules/kernel';

import {
  hasScopePermission,
  scopeUserId,
} from '@/modules/auth/application/scope-authorization';

const scope = {
  userId: toUserId('user-1'),
  role: 'admin',
} as const;

describe('scope authorization helpers', () => {
  it('resolves the scoped user id and delegates permission checks', async () => {
    const permissionChecker = {
      hasPermission: vi.fn(async () => true),
    };

    expect(scopeUserId(scope)).toBe('user-1');
    await expect(
      hasScopePermission({
        permissionChecker,
        scope,
        permissions: { book: ['read'] },
      })
    ).resolves.toBe(true);
    expect(permissionChecker.hasPermission).toHaveBeenCalledWith('user-1', {
      book: ['read'],
    });
  });
});
