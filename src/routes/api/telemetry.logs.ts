import { createFileRoute } from '@tanstack/react-router';

import { handleFrontendLogsRequest } from '@/composition/telemetry/transport';

export const Route = createFileRoute('/api/telemetry/logs')({
  server: {
    handlers: {
      POST: ({ request }) => handleFrontendLogsRequest(request),
    },
  },
});
