import { RPCHandler } from '@orpc/server/fetch';
import {
  CORSHandlerPlugin,
  ResponseHeadersHandlerPlugin,
} from '@orpc/server/plugins';
import { createFileRoute } from '@tanstack/react-router';

import { corsAllowedOrigins } from '@/server/cors';
import { router } from '@/server/router';

const handler = new RPCHandler(router, {
  plugins: [
    new CORSHandlerPlugin({ origin: corsAllowedOrigins }),
    new ResponseHeadersHandlerPlugin(),
  ],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: {}, // Provide initial context if needed
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export const Route = createFileRoute('/api/rpc/$')({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
      // CORS preflight
      OPTIONS: handle,
    },
  },
});
