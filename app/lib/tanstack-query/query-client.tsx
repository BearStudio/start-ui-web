import { ORPCError } from '@orpc/client';
import { MutationCache, QueryClient } from '@tanstack/react-query';

import { openDemoModeDrawer } from '@/features/demo-mode/demo-mode-drawer';

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
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error instanceof ORPCError && error.message === 'DEMO_MODE_ENABLED') {
        openDemoModeDrawer();
      }
    },
  }),
});
