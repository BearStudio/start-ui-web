import { createServerFileRoute } from '@tanstack/react-start/server';
import { handleRequest, route, type Router } from 'better-upload/server';

import { s3client } from '@/lib/object-storage';

import { envServer } from '@/env/server';

// [TODO] Voir pour bouger cette logique directement dans orpc
const router: Router = {
  client: s3client,
  bucketName: envServer.OBJECT_STORAGE_BUCKET_NAME,
  routes: {
    avatar: route({
      fileTypes: ['image/*'],
      maxFileSize: 1024 * 1024 * 4, // 4MB
      onBeforeUpload: async () => {
        // [TODO] Ajouter la logique d'authentification
      },
    }),
  },
};

async function handle({ request }: { request: Request }) {
  return handleRequest(request, router);
}

export const ServerRoute = createServerFileRoute('/api/upload').methods({
  POST: handle,
});
