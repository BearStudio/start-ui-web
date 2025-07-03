import { RPCHandler } from '@orpc/server/fetch';
import { CORSPlugin, ResponseHeadersPlugin } from '@orpc/server/plugins';
import { createServerFileRoute } from '@tanstack/react-start/server';

import { router } from '@/server/router';

const handler = new RPCHandler(router, {
  plugins: [new CORSPlugin(), new ResponseHeadersPlugin()],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: {}, // Provide initial context if needed
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export const ServerRoute = createServerFileRoute('/api/rpc/$').methods({
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
});
