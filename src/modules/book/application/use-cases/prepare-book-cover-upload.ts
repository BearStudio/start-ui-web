import { Result } from '@swan-io/boxed';

import type { UserId } from '@/modules/kernel/domain/ids';

import type {
  BookCoverUploadOutcome,
  BookResult,
  BookUseCaseDeps,
} from './types';
import { createBookCoverObjectKey } from '../../domain/book-policy';

export type PrepareBookCoverUploadInput = {
  currentUserId: UserId;
  fileType: string;
};

export async function prepareBookCoverUpload(
  deps: BookUseCaseDeps,
  input: PrepareBookCoverUploadInput
): Promise<BookResult<BookCoverUploadOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { book: ['create', 'update'] }
  );
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'book_cover_upload_forbidden' });
  }

  const objectKey = createBookCoverObjectKey({
    fileId: deps.idGenerator.createId(),
    fileType: input.fileType,
  });
  if (!objectKey) {
    return Result.Ok({ type: 'book_cover_upload_invalid_file_type' });
  }

  deps.logger.info({
    event: 'book.cover_upload.prepare',
    details: {
      fileType: input.fileType,
    },
  });
  return Result.Ok({
    type: 'book_cover_upload_prepared',
    upload: { objectKey },
  });
}
