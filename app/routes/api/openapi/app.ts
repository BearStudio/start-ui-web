import { createServerFileRoute } from '@tanstack/react-start/server';

import { scalarUiResponse } from '@/server/openapi';

export const ServerRoute = createServerFileRoute('/api/openapi/app').methods({
  GET: async () =>
    scalarUiResponse({ title: 'App', schemaUrl: '/api/openapi/app/schema' }),
});
