import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { openDemoModeDrawer } from '@/features/demo/demo-mode-drawer';
import { isServerFnError } from '@/server/server-fn-error';

const networkMode = import.meta.env.DEV ? 'always' : undefined;

const handleDemoModeError = (error: unknown) => {
  if (isServerFnError(error) && error.message === 'DEMO_MODE_ENABLED') {
    openDemoModeDrawer();
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleDemoModeError,
  }),
  mutationCache: new MutationCache({
    onError: handleDemoModeError,
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
