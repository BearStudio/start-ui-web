import { createFileRoute } from '@tanstack/react-router';

import { handleOtlpProxyRequest } from '@/composition/telemetry/transport';

export const Route = createFileRoute('/api/telemetry/otel/v1/metrics')({
  server: {
    handlers: {
      POST: ({ request }) => handleOtlpProxyRequest(request, 'metrics'),
    },
  },
});
