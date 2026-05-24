import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { envClient } from '@/platform/env/client';

const networkMode = envClient.DEV ? 'always' : undefined;

type QueryClientOptions = {
  onError?: (error: unknown) => void;
};

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
        networkMode,
      },
      mutations: {
        networkMode,
      },
    },
  });
