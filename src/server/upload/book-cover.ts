import { RejectUpload, route } from '@better-upload/server';

import i18n from '@/lib/i18n';

import { bookCoverAcceptedFileTypes } from '@/features/book/schema';
import { auth } from '@/server/auth';

export const bookCover = route({
  fileTypes: bookCoverAcceptedFileTypes,
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
      },
    });

    if (!canUpdateBookCover.success) {
      throw new RejectUpload(i18n.t('book:manager.uploadErrors.UNAUTHORIZED'));
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
});
