import {
  type QueryClient,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';

import { authServerFunctions } from '../server-functions';

export const authQueries = {
  all: () => ['auth'] as const,
  currentSession: () =>
    queryOptions({
      queryKey: [...authQueries.all(), 'currentSession'] as const,
      queryFn: () => authServerFunctions.currentSession(),
    }),
};

export const useCurrentSessionQuery = () =>
  useQuery(authQueries.currentSession());

export const useCurrentScopeKey = () =>
  useCurrentSessionQuery().data?.scopeKey ?? 'anonymous';

export function clearAuthScopedQueryState(queryClient: QueryClient) {
  queryClient.clear();
}
