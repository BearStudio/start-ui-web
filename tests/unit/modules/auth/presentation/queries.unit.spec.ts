import { QueryClient, queryOptions } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { authQueries } from '@/modules/auth/client';
import {
  clearAllQueryStateForAuthBoundary,
  createAuthQueries,
} from '@/modules/auth/presentation/queries';

describe('clearAllQueryStateForAuthBoundary', () => {
  it('uses a versioned session query key', () => {
    expect(authQueries.all()).toEqual(['auth', 'v1']);
    expect(authQueries.currentSession().queryKey).toEqual([
      'auth',
      'v1',
      'currentSession',
    ]);
  });

  it('calls the injected facade for the current session query', async () => {
    const facade = {
      currentSession: vi.fn(async () => null),
    };
    const queries = createAuthQueries(facade);

    await (queries.currentSession().queryFn as () => Promise<unknown>)();

    expect(facade.currentSession).toHaveBeenCalledWith();
  });

  it('clears all query and mutation state after an auth boundary changes', () => {
    const queryClient = new QueryClient();
    const bookListQuery = queryOptions({
      queryKey: ['book', 'v1', 'list', 'user-1'] as const,
      queryFn: async () => [{ id: 'book-1' }],
    });

    queryClient.setQueryData(authQueries.currentSession().queryKey, null);
    queryClient.setQueryData(bookListQuery.queryKey, [{ id: 'book-1' }]);

    clearAllQueryStateForAuthBoundary(queryClient);

    expect(queryClient.getQueryCache().findAll()).toEqual([]);
  });
});
