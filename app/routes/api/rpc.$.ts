import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { createAPIFileRoute } from '@tanstack/start/api';

import { router } from '@/server/router';

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: {}, // Provide initial context if needed
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export const APIRoute = createAPIFileRoute('/api/rpc/$')({
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
});
