import { json } from '@tanstack/react-start';
import { createServerFileRoute } from '@tanstack/react-start/server';

import { envClient } from '@/env/client';
import { auth } from '@/server/auth';

export const ServerRoute = createServerFileRoute(
  '/api/openapi/auth/schema'
).methods({
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
