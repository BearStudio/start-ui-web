import { createFileRoute } from '@tanstack/react-router';

import { handleAuthRequest } from '@/modules/auth/backend';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => {
        return handleAuthRequest(request);
      },
      POST: ({ request }) => {
        return handleAuthRequest(request);
      },
    },
  },
});
