import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isMatching, P } from 'ts-pattern';

import { recordQueryCacheEvent } from '@/platform/lib/tanstack-query/observability';

import { envClient } from '@/platform/env/client';
import { frontendLogger } from '@/platform/telemetry/frontend-logger';
import { deriveOperationMetadataFromKey } from '@/platform/telemetry/metadata';

const networkMode = envClient.DEV ? 'always' : undefined;
const DEFAULT_STALE_TIME_MS = 60_000;
const DEFAULT_GC_TIME_MS = 5 * 60_000;
const MAX_QUERY_RETRIES = 2;

type QueryClientOptions = {
  onError?: (error: unknown) => void;
};

function getHttpStatus(error: unknown): number | undefined {
  return isMatching({ status: P.number }, error) ? error.status : undefined;
}

export function shouldRetryQuery(
  failureCount: number,
  error: unknown
): boolean {
  const status = getHttpStatus(error);

  if (status !== undefined && status >= 400 && status < 500) {
    return false;
  }

  return failureCount < MAX_QUERY_RETRIES;
}

const logQueryCacheEvent = (
  queryKey: readonly unknown[],
  operationType: 'mutation' | 'query',
  status: 'error' | 'success',
  error?: unknown
) => {
  const metadata = deriveOperationMetadataFromKey(queryKey, operationType);
  const event = `query.${operationType}.${status}`;
  const details = {
    operationName: metadata.operationName,
    operationType,
    status,
  };

  if (status === 'error') {
    frontendLogger.error(event, {
      details,
      error,
    });
    return;
  }

  frontendLogger.debug(event, { details });
};

export const createAppQueryClient = (options: QueryClientOptions = {}) =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        recordQueryCacheEvent(query.queryKey, 'query', 'error');
        logQueryCacheEvent(query.queryKey, 'query', 'error', error);
        options.onError?.(error);
      },
      onSuccess: (_data, query) => {
        recordQueryCacheEvent(query.queryKey, 'query', 'success');
        logQueryCacheEvent(query.queryKey, 'query', 'success');
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _onMutateResult, mutation) => {
        const mutationKey = mutation.options.mutationKey ?? ['mutation'];
        recordQueryCacheEvent(mutationKey, 'mutation', 'error');
        logQueryCacheEvent(mutationKey, 'mutation', 'error', error);
        options.onError?.(error);
      },
      onSuccess: (_data, _variables, _onMutateResult, mutation) => {
        const mutationKey = mutation.options.mutationKey ?? ['mutation'];
        recordQueryCacheEvent(mutationKey, 'mutation', 'success');
        logQueryCacheEvent(mutationKey, 'mutation', 'success');
      },
    }),
    defaultOptions: {
      queries: {
        gcTime: DEFAULT_GC_TIME_MS,
        networkMode,
        retry: shouldRetryQuery,
        staleTime: DEFAULT_STALE_TIME_MS,
      },
      mutations: {
        networkMode,
        retry: 0,
      },
    },
  });
