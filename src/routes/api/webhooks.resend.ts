import { createFileRoute } from '@tanstack/react-router';

import { handleResendWebhookRequest } from '@/modules/email/backend';

export const Route = createFileRoute('/api/webhooks/resend')({
  server: {
    handlers: {
      POST: ({ request }) => {
        return handleResendWebhookRequest(request);
      },
    },
  },
});
