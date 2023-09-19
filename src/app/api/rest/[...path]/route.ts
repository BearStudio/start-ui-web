import { NextRequest } from 'next/server';

import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { createOpenApiFetchHandler } from '@/server/api/trpcOpenApiFetchAdapter';

const handler = createOpenApiFetchHandler({
  router: appRouter as any,
  createContext: createTRPCContext,
  endpoint: '/api/rest',
});

export const GET = (req: NextRequest) => {
  return handler(req);
};
export const POST = handler;
