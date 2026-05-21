import { createFileRoute } from '@tanstack/react-router';

import {
  handleBookUploadRequest,
  type UploadRoutes,
} from '@/composition/book-upload';

// Used to type route param on UploadButton component
// This is to prevent typo issues when specifying the uploadRoute prop
export type { UploadRoutes };

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: ({ request }) => {
        return handleBookUploadRequest(request);
      },
    },
  },
});
