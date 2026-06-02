import {
  type QueryClient,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';

import { observeQueryOperation } from '@/platform/lib/tanstack-query/observability';

import type { CurrentSession } from '@/modules/auth';
import type { ScopeKey } from '@/modules/kernel/domain/ids';
import { toScopeKey } from '@/modules/kernel/domain/ids';

import { authServerFunctions } from '../server';

const currentSessionQueryKey = [...authQueriesAll(), 'currentSession'] as const;

function authQueriesAll() {
  return ['auth', 'v1'] as const;
}

export const authQueries = {
  all: authQueriesAll,
  currentSession: () =>
    queryOptions({
      queryKey: currentSessionQueryKey,
      queryFn: () =>
        observeQueryOperation(currentSessionQueryKey, 'query', () =>
          authServerFunctions.currentSession()
        ),
    }),
};

export const useCurrentSessionQuery = (initialData?: CurrentSession | null) =>
  useQuery({
    ...authQueries.currentSession(),
    ...(initialData === undefined ? {} : { initialData }),
  });

export const useCurrentScopeKey = (): ScopeKey =>
  useCurrentSessionQuery().data?.scopeKey ?? toScopeKey('anonymous');

/**
 * Clears every query and mutation after an auth boundary change so cached
 * user-specific data cannot leak between sessions.
 */
export function clearAllQueryStateForAuthBoundary(queryClient: QueryClient) {
  queryClient.clear();
}
