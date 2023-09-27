import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { createOpenApiFetchHandler } from '@/server/api/trpcOpenApiFetchAdapter';

const handler = createOpenApiFetchHandler({
  router: appRouter as TODO,
  createContext: createTRPCContext,
  endpoint: '/api/rest',
});

export const GET = handler;
export const POST = handler;
