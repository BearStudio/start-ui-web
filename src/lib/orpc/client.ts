import { createORPCClient, onError, ORPCError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { RouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

import { envClient } from '@/env/client';
import { openDemoModeDrawer } from '@/features/demo/demo-mode-drawer';

import type { Router } from './types';

const link = new RPCLink({
  url: '/api/rpc',
  // Relative URLs only work in the browser, SSR needs an explicit origin
  origin: typeof window === 'undefined' ? envClient.VITE_BASE_URL : undefined,
  interceptors: [
    onError((error) => {
      if (error instanceof ORPCError && error.message === 'DEMO_MODE_ENABLED') {
        openDemoModeDrawer();
      }
    }),
  ],
});

const orpcClient: RouterClient<Router> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(orpcClient);
