import { describe, expect, it } from 'vitest';

import { toScopeKey, toUserId } from '@/modules/kernel/domain/ids';
import { userQueries } from '@/modules/user/presentation/queries';

describe('user query keys', () => {
  it('partitions protected read keys by scope', () => {
    const scopeA = toScopeKey('scope-a');
    const scopeB = toScopeKey('scope-b');

    expect(userQueries.all()).toEqual(['user', 'v1']);
    expect(userQueries.getAll(scopeA)).toEqual([
      'user',
      'v1',
      { scopeKey: scopeA },
      'getAll',
    ]);
    expect(
      userQueries.getAllInfinite({ scopeKey: scopeA }).queryKey
    ).not.toEqual(userQueries.getAllInfinite({ scopeKey: scopeB }).queryKey);

    expect(
      userQueries.getUserSessionsInfinite({
        userId: toUserId('user-1'),
        scopeKey: scopeA,
      }).queryKey
    ).toContainEqual({ scopeKey: scopeA });
  });

  it('versions mutation keys', () => {
    expect(userQueries.create().mutationKey).toEqual(['user', 'v1', 'create']);
    expect(userQueries.updateById().mutationKey).toEqual([
      'user',
      'v1',
      'updateById',
    ]);
    expect(userQueries.deleteById().mutationKey).toEqual([
      'user',
      'v1',
      'deleteById',
    ]);
    expect(userQueries.revokeUserSessions().mutationKey).toEqual([
      'user',
      'v1',
      'revokeUserSessions',
    ]);
    expect(userQueries.revokeUserSession().mutationKey).toEqual([
      'user',
      'v1',
      'revokeUserSession',
    ]);
  });
});
