/* oxlint-disable @tanstack/query/exhaustive-deps -- Query factories inject a stable facade; facade identity is not a cache-key dimension. */
import {
  type QueryClient,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';

import { observeQueryOperation } from '@/platform/lib/tanstack-query/observability';
import type { ServerFunctionFacade } from '@/platform/lib/tanstack-start/server-function-types';

import type { CurrentSession } from '@/modules/auth';
import type { ScopeKey } from '@/modules/kernel/domain/ids';
import { toScopeKey } from '@/modules/kernel/domain/ids';

import type { AuthServerFunctions } from '../server';

const currentSessionQueryKey = [...authQueriesAll(), 'currentSession'] as const;

function authQueriesAll() {
  return ['auth', 'v1'] as const;
}

export type AuthQueryFacade = ServerFunctionFacade<
  Pick<AuthServerFunctions, 'currentSession'>
>;

export const createAuthQueries = <TFacade extends AuthQueryFacade>(
  facade: TFacade
) => ({
  all: authQueriesAll,
  currentSession: () =>
    queryOptions({
      queryKey: currentSessionQueryKey,
      queryFn: () =>
        observeQueryOperation(currentSessionQueryKey, 'query', () =>
          facade.currentSession()
        ),
    }),
});

type AuthQueries = ReturnType<typeof createAuthQueries>;

export const createAuthQueryHooks = (authQueries: AuthQueries) => ({
  useCurrentSessionQuery: (initialData?: CurrentSession | null) =>
    useQuery({
      ...authQueries.currentSession(),
      ...(initialData === undefined ? {} : { initialData }),
    }),

  useCurrentScopeKey: (): ScopeKey =>
    useQuery(authQueries.currentSession()).data?.scopeKey ??
    toScopeKey('anonymous'),
});

/**
 * Clears every query and mutation after an auth boundary change so cached
 * user-specific data cannot leak between sessions.
 */
export function clearAllQueryStateForAuthBoundary(queryClient: QueryClient) {
  queryClient.clear();
}
