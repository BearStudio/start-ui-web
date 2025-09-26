import { createFileRoute } from '@tanstack/react-router';

import { scalarUiResponse } from '@/server/openapi';

export const Route = createFileRoute('/api/openapi/app')({
  server: {
    handlers: {
      GET: async () =>
        scalarUiResponse({
          title: 'App',
          schemaUrl: '/api/openapi/app/schema',
        }),
    },
  },
});
