import { QueryClient, queryOptions } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { authQueries, clearAuthScopedQueryState } from './queries';

describe('clearAuthScopedQueryState', () => {
  it('clears all query and mutation state after an auth boundary changes', () => {
    const queryClient = new QueryClient();
    const bookListQuery = queryOptions({
      queryKey: ['book', 'list', 'user-1'] as const,
      queryFn: async () => [{ id: 'book-1' }],
    });

    queryClient.setQueryData(authQueries.currentSession().queryKey, null);
    queryClient.setQueryData(bookListQuery.queryKey, [{ id: 'book-1' }]);

    clearAuthScopedQueryState(queryClient);

    expect(queryClient.getQueryCache().findAll()).toEqual([]);
  });
});
