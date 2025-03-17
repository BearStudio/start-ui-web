import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';

import { envClient } from '@/env/client';
import { auth } from '@/server/auth';

export const APIRoute = createAPIFileRoute('/api/openapi/auth/schema')({
  GET: async () => {
    const spec = await auth.api.generateOpenAPISchema();
    spec.info.title = 'Auth API';
    spec.info.description = `API Reference for the Better Auth instance.<br /><br /> <a href="${envClient.VITE_BASE_URL}/api/openapi/app">Go the <strong>Application API</strong> documentation</a>`;
    spec.servers = [
      {
        url: `${envClient.VITE_BASE_URL}/api/auth`,
      },
    ];
    return json(spec);
  },
});
