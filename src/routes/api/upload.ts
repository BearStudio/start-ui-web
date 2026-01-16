import { handleRequest, type Router } from '@better-upload/server';
import { createFileRoute } from '@tanstack/react-router';

import { envClient } from '@/env/client';
import { envServer } from '@/env/server';
import { uploadClient } from '@/server/s3';
import { bookCover } from '@/server/upload/book-cover';

const router = {
  client: uploadClient,
  bucketName: envServer.S3_BUCKET_NAME,
  routes: {
    bookCover,
  },
} as const satisfies Router;

// Used to type route param on UploadButton component
// This is to prevent typo issues when specifying the uploadRoute prop
export type UploadRoutes = keyof typeof router.routes;

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: ({ request }) => {
        if (envClient.VITE_IS_DEMO) {
          return new Response('Demo Mode', { status: 405 });
        }
        return handleRequest(request, router);
      },
    },
  },
});
