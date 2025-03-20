import { createAPIFileRoute } from '@tanstack/react-start/api';

import { scalarUiResponse } from '@/server/openapi';

export const APIRoute = createAPIFileRoute('/api/openapi/app')({
  GET: async () =>
    scalarUiResponse({ title: 'App', schemaUrl: '/api/openapi/app/schema' }),
});
