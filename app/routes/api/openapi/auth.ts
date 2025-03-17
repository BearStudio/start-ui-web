import { createAPIFileRoute } from '@tanstack/start/api';

import { scalarUiResponse } from '@/server/openapi';

export const APIRoute = createAPIFileRoute('/api/openapi/auth')({
  GET: async () =>
    scalarUiResponse({ title: 'Auth', schemaUrl: '/api/openapi/auth/schema' }),
});
