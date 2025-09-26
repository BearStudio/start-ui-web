import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { CORSPlugin, ResponseHeadersPlugin } from '@orpc/server/plugins';
import { createFileRoute } from '@tanstack/react-router';

import { router } from '@/server/router';

const handler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin(), new ResponseHeadersPlugin()],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: '/api/rest',
    context: {}, // Provide initial context if needed
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export const Route = createFileRoute('/api/rest/$')({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});
