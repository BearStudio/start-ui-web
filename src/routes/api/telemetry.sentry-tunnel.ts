import { createFileRoute } from '@tanstack/react-router';

import { handleSentryTunnelRequest } from '@/composition/telemetry/transport';

export const Route = createFileRoute('/api/telemetry/sentry-tunnel')({
  server: {
    handlers: {
      POST: ({ request }) => handleSentryTunnelRequest(request),
    },
  },
});
