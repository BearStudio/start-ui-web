import { createFileRoute } from '@tanstack/react-router';
import {
  handleRequest,
  RejectUpload,
  route,
  type Router,
} from 'better-upload/server';

import { s3client } from '@/lib/s3';

import { envServer } from '@/env/server';
import { auth } from '@/server/auth';

const router: Router = {
  client: s3client,
  bucketName: envServer.S3_BUCKET_NAME,
  routes: {
    avatar: route({
      fileTypes: ['image/png', 'image/jpeg', 'image/webp'],
      maxFileSize: 1024 * 1024 * 100, // 100Mb
      onBeforeUpload: async ({ req, file }) => {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
          // The message error thrown here is visible to the user
          // as a field error message.
          // [TODO] Check to send i18n key so the message can be translated
          throw new RejectUpload('Not logged in!');
        }

        const fileExtension = file.type.split('/').at(-1) as string;

        return {
          // Here we want to keep the filename always the same
          // Each avatar upload will erase the previous one.
          objectInfo: {
            key: `${session.user.id}/avatar.${fileExtension}`,
          },
        };
      },
    }),
  },
};

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: ({ request }) => handleRequest(request, router),
    },
  },
});
