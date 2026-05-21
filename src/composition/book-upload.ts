import { handleRequest, type Router } from '@better-upload/server';

import { bookCover } from '@/modules/book/transport/upload/book-cover';
import { env } from '@/modules/kernel/infrastructure/config/env';
import { uploadClient } from '@/modules/kernel/infrastructure/storage/better-upload';

const router = {
  client: uploadClient,
  bucketName: env.S3_BUCKET_NAME,
  routes: {
    bookCover,
  },
} as const satisfies Router;

export type UploadRoutes = keyof typeof router.routes;

export const handleBookUploadRequest = (request: Request) => {
  if (env.VITE_IS_DEMO) {
    return new Response('Demo Mode', { status: 405 });
  }
  return handleRequest(request, router);
};
