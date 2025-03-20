import { createAPIFileRoute } from '@tanstack/react-start/api';

import { auth } from '@/server/auth';

export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: ({ request }) => {
    return auth.handler(request);
  },
  POST: ({ request }) => {
    return auth.handler(request);
  },
});
