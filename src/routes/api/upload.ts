import {
  handleRequest,
  RejectUpload,
  route,
  type Router,
} from '@better-upload/server';
import { createFileRoute } from '@tanstack/react-router';

import i18n from '@/lib/i18n';
import { uploadClient } from '@/lib/s3';

import { envServer } from '@/env/server';
import { auth } from '@/server/auth';

const router = {
  client: uploadClient,
  bucketName: envServer.S3_BUCKET_NAME,
  routes: {
    bookCover: route({
      // [TODO] Check to find a way to extract these rules so they can be reused in the accept field of file inputs
      fileTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      maxFileSize: 1024 * 1024 * 100, // 100Mb
      onBeforeUpload: async ({ req, file }) => {
        const session = await auth.api.getSession(req);
        if (!session?.user) {
          throw new RejectUpload(
            i18n.t('book:manager.uploadErrors.NOT_AUTHENTICATED')
          );
        }

        // Only admins should be able to update book covers
        const canUpdateBookCover = await auth.api.userHasPermission({
          body: {
            userId: session.user.id,
            permissions: {
              book: ['create', 'update'],
            },
            role: 'admin',
          },
        });

        if (!canUpdateBookCover.success) {
          throw new RejectUpload(
            i18n.t('book:manager.uploadErrors.UNAUTHORIZED')
          );
        }

        // normalize file extension from detected mimetype (file.type)
        const fileExtension = file.type.split('/').at(-1) as string;
        return {
          // I think it is a good idea to create a random file id
          // This allow us to invalidate cache (because the id will always be random)
          // and it also prevent the user to upload a file with the same name (aka. objectKey), but different file content
          objectInfo: {
            key: `books/${crypto.randomUUID()}.${fileExtension}`,
          },
        };
      },
    }),
  },
} as const satisfies Router;

// Used to type route param on UploadButton component
// This is to prevent typo issues when specifying the uploadRoute prop
export type UploadRoutes = keyof typeof router.routes;

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: ({ request }) => handleRequest(request, router),
    },
  },
});
