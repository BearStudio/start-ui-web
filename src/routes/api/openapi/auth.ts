import { createFileRoute } from '@tanstack/react-router';

import { scalarUiResponse } from '@/server/openapi';

export const Route = createFileRoute('/api/openapi/auth')({
  server: {
    handlers: {
      GET: async () =>
        scalarUiResponse({
          title: 'Auth',
          schemaUrl: '/api/openapi/auth/schema',
        }),
    },
  },
});
