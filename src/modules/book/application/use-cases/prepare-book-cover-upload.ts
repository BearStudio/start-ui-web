import { Result } from '@swan-io/boxed';

import { hasScopePermission, type RequestScope } from '@/modules/auth';

import type {
  BookCoverUploadOutcome,
  BookResult,
  BookUseCaseDeps,
} from './types';
import { createBookCoverObjectKey } from '../../domain/book-policy';

export type PrepareBookCoverUploadInput = {
  scope: RequestScope;
  fileType: string;
};

export async function prepareBookCoverUpload(
  deps: BookUseCaseDeps,
  input: PrepareBookCoverUploadInput
): Promise<BookResult<BookCoverUploadOutcome>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { book: ['create', 'update'] },
  });
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
