import { createServerFileRoute } from '@tanstack/react-start/server';

import { scalarUiResponse } from '@/server/openapi';

export const ServerRoute = createServerFileRoute('/api/openapi/auth').methods({
  GET: async () =>
    scalarUiResponse({ title: 'Auth', schemaUrl: '/api/openapi/auth/schema' }),
});
