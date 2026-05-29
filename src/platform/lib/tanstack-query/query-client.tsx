import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { envClient } from '@/platform/env/client';

const networkMode = envClient.DEV ? 'always' : undefined;
const DEFAULT_STALE_TIME_MS = 60_000;
const DEFAULT_GC_TIME_MS = 5 * 60_000;
const MAX_QUERY_RETRIES = 2;

type QueryClientOptions = {
  onError?: (error: unknown) => void;
};

function getHttpStatus(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
  ) {
    return error.status;
  }

  return undefined;
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

export const createAppQueryClient = (options: QueryClientOptions = {}) =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: options.onError,
    }),
    mutationCache: new MutationCache({
      onError: options.onError,
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
