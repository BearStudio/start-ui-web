import { createORPCClient, onError, ORPCError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createORPCReactQueryUtils } from '@orpc/react-query';
import type { RouterClient } from '@orpc/server';

import { envClient } from '@/env/client';
import { openDemoModeDrawer } from '@/features/demo/demo-mode-drawer'; // !STARTERCONF [demoMode] Remove this import

import type { Router } from './types';

const link = new RPCLink({
  url: `${envClient.VITE_BASE_URL}/api/rpc`,
  interceptors: [
    onError((error) => {
      // !STARTERCONF [demoMode] Remove this condition
      if (error instanceof ORPCError && error.message === 'DEMO_MODE_ENABLED') {
        openDemoModeDrawer();
      }
    }),
  ],
});

const orpcClient: RouterClient<Router> = createORPCClient(link);

export const orpc = createORPCReactQueryUtils(orpcClient);
