import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { RouterClient } from '@orpc/server';

import { envClient } from '@/env/client';
import type { Router } from '@/server/router';

const link = new RPCLink({
  url: `${envClient.VITE_BASE_URL}/api/rpc`,
});

export const orpc: RouterClient<Router> = createORPCClient(link);
