import { createServerFileRoute } from '@tanstack/react-start/server';
import { handleRequest, route, type Router } from 'better-upload/server';

import { s3client } from '@/lib/s3';

import { envServer } from '@/env/server';

const router: Router = {
  client: s3client,
  bucketName: envServer.S3_BUCKET_NAME,
  routes: {
    avatar: route({
      fileTypes: [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/gif',
        'image/avif',
      ],
      maxFileSize: 1024 * 1024 * 100, // 100MB
    }),
  },
};

async function handle({ request }: { request: Request }) {
  return handleRequest(request, router);
}

export const ServerRoute = createServerFileRoute('/api/upload').methods({
  POST: handle,
});
