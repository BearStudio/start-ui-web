import { createAPIFileRoute } from '@tanstack/start/api';

import { previewEmailRoute } from '@/server/email';

export const APIRoute = createAPIFileRoute('/api/dev/email/$template')({
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
