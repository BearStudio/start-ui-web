import { createFileRoute } from '@tanstack/react-router';
import {
  handleRequest,
  RejectUpload,
  route,
  type Router,
} from 'better-upload/server';

import i18n from '@/lib/i18n';
import { s3client } from '@/lib/s3';

import { envServer } from '@/env/server';
import { auth } from '@/server/auth';

const router: Router = {
  client: s3client,
  bucketName: envServer.S3_BUCKET_NAME,
  routes: {
    bookCover: route({
      fileTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      maxFileSize: 1024 * 1024 * 100, // 100Mb
      onBeforeUpload: async ({ req, file }) => {
        const session = await auth.api.getSession({ headers: req.headers });
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

        // normalize file extension from detected mimetype
        const fileExtension = file.type.split('/').at(-1) as string;
        return {
          // I think it is a good idea to create a random file id as it impersonate the file name (which can contains sensitive data :/ ?)
          objectInfo: {
            key: `books/${crypto.randomUUID()}.${fileExtension}`,
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
