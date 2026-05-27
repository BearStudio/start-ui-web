import { createFileRoute } from '@tanstack/react-router';

import { handleEmailPreviewRequest } from '@/composition/email-preview';

export const Route = createFileRoute('/api/dev/email/$template')({
  server: {
    handlers: {
      GET: ({ request, params }) => {
        return handleEmailPreviewRequest(request, params.template);
      },
    },
  },
});
