import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { createTRPCContext } from '@/server/config/trpc';
import { appRouter } from '@/server/router';

// this is the server RPC API handler

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: createTRPCContext,
  });
};

export { handler as GET, handler as POST };
