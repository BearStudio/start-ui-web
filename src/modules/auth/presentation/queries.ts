import {
  type QueryClient,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';

import type { CurrentSession } from '../domain/request-scope';
import { authServerFunctions } from '../server';

export const authQueries = {
  all: () => ['auth'] as const,
  currentSession: () =>
    queryOptions({
      queryKey: [...authQueries.all(), 'currentSession'] as const,
      queryFn: () => authServerFunctions.currentSession(),
    }),
};

export const useCurrentSessionQuery = (initialData?: CurrentSession | null) =>
  useQuery({
    ...authQueries.currentSession(),
    ...(initialData === undefined ? {} : { initialData }),
  });

export const useCurrentScopeKey = () =>
  useCurrentSessionQuery().data?.scopeKey ?? 'anonymous';

/**
 * Clears every query and mutation after an auth boundary change so cached
 * user-specific data cannot leak between sessions.
 */
export function clearAllQueryStateForAuthBoundary(queryClient: QueryClient) {
  queryClient.clear();
}
