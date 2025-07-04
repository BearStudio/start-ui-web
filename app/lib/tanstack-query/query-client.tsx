import { QueryClient } from '@tanstack/react-query';

const networkMode = import.meta.dev ? 'always' : undefined;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode,
    },
    mutations: {
      networkMode,
    },
  },
});
