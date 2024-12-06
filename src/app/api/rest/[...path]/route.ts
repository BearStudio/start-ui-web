import { createOpenApiFetchHandler } from 'trpc-to-openapi';

import { createTRPCContext } from '@/server/config/trpc';
import { appRouter } from '@/server/router';

const handler = (req: Request) => {
  return createOpenApiFetchHandler({
    req,
    endpoint: '/api/rest',
    router: appRouter,
    createContext: createTRPCContext,
  });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
