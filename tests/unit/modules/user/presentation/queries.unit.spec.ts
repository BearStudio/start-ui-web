import { describe, expect, it } from 'vitest';

import { toScopeKey, toUserId } from '@/modules/kernel/domain/ids';
import { userQueries } from '@/modules/user/presentation/queries';

describe('user query keys', () => {
  it('partitions protected read keys by scope', () => {
    const scopeA = toScopeKey('scope-a');
    const scopeB = toScopeKey('scope-b');

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
});
