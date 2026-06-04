import { Result } from '@swan-io/boxed';
import { describe, expect, it, vi } from 'vitest';

import { hasScopePermission, scopeUserId } from '@/modules/auth/testing';
import { toUserId } from '@/modules/kernel';
import type { ApplicationResult } from '@/modules/kernel/testing';

const scope = {
  userId: toUserId('user-1'),
  role: 'admin',
} as const;

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

describe('scope authorization helpers', () => {
  it('resolves the scoped user id and delegates permission checks', async () => {
    const permissionChecker = {
      hasPermission: vi.fn(async () =>
        Result.Ok({ type: 'permission_granted' as const })
      ),
    };

    expect(scopeUserId(scope)).toBe('user-1');
    const result = await hasScopePermission({
      permissionChecker,
      scope,
      permissions: { book: ['read'] },
    });

    expect(getOk(result)).toEqual({ type: 'permission_granted' });
    expect(permissionChecker.hasPermission).toHaveBeenCalledWith('user-1', {
      book: ['read'],
    });
  });
});
