import { createFileRoute } from '@tanstack/react-router';

import { handleOtlpProxyRequest } from '@/composition/telemetry/transport';

export const Route = createFileRoute('/api/telemetry/otel/v1/traces')({
  server: {
    handlers: {
      POST: ({ request }) => handleOtlpProxyRequest(request, 'traces'),
    },
  },
});
