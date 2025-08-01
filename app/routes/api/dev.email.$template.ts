import { createServerFileRoute } from '@tanstack/react-start/server';

import { previewEmailRoute } from '@/server/email';

export const ServerRoute = createServerFileRoute(
  '/api/dev/email/$template'
).methods({
  GET: ({ request, params }) => {
    // Allows debug only in development
    if (import.meta.env.PROD) {
      return new Response(undefined, {
        status: 404,
      });
    }
    const query = request.url.split('?')[1];
    const props = Object.fromEntries(new URLSearchParams(query ?? ''));
    return previewEmailRoute(params.template, props);
  },
});
