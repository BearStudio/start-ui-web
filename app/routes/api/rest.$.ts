import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { onError } from '@orpc/server';
import { CORSPlugin, ResponseHeadersPlugin } from '@orpc/server/plugins';
import { createAPIFileRoute } from '@tanstack/react-start/api';

import { router } from '@/server/router';

const handler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin(), new ResponseHeadersPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: '/api/rest',
    context: {}, // Provide initial context if needed
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export const APIRoute = createAPIFileRoute('/api/rest/$')({
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
});
