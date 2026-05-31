import { describe, expect, it } from 'vitest';

import { userQueries } from '@/modules/user/presentation/queries';

describe('user query keys', () => {
  it('partitions protected read keys by scope', () => {
    expect(
      userQueries.getAllInfinite({ scopeKey: 'scope-a' }).queryKey
    ).not.toEqual(userQueries.getAllInfinite({ scopeKey: 'scope-b' }).queryKey);

    expect(
      userQueries.getUserSessionsInfinite({
        userId: 'user-1',
        scopeKey: 'scope-a',
      }).queryKey
    ).toContainEqual({ scopeKey: 'scope-a' });
  });
});
