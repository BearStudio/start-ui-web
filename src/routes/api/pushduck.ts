import { createFileRoute } from '@tanstack/react-router';

import { envClient } from '@/env/client';
import { auth } from '@/server/auth';
import { uploadRouter } from '@/server/pushduck';

export const Route = createFileRoute('/api/pushduck')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (envClient.VITE_IS_DEMO) {
          return new Response('Demo Mode', { status: 405 });
        }

        const session = await auth.api.getSession(request);
        if (!session?.user) {
          return new Response('Unauthorized', { status: 401 });
        }

        const { GET } = uploadRouter.handlers;
        return GET(request);
      },
      POST: async ({ request }) => {
        if (envClient.VITE_IS_DEMO) {
          return new Response('Demo Mode', { status: 405 });
        }

        const session = await auth.api.getSession(request);
        if (!session?.user) {
          return new Response('Unauthorized', { status: 401 });
        }

        const { POST } = uploadRouter.handlers;
        return POST(request);
      },
    },
  },
});
