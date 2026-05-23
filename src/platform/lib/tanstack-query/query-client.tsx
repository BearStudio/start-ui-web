import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

const networkMode = import.meta.env.DEV ? 'always' : undefined;

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
