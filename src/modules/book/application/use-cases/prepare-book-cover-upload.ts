import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';

import type { BookUseCaseDeps, UseCaseResult } from './types';
import { createBookCoverObjectKey } from '../../domain/book-policy';

export type PrepareBookCoverUploadInput = {
  scope: RequestScope;
  fileType: string;
};

export type PreparedBookCoverUpload = {
  objectKey: string;
};

export async function prepareBookCoverUpload(
  deps: BookUseCaseDeps,
  input: PrepareBookCoverUploadInput
): Promise<
  UseCaseResult<PreparedBookCoverUpload, 'forbidden' | 'invalid_file_type'>
> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { book: ['create', 'update'] },
  });
  if (!allowed) return fail('forbidden');

  const objectKey = createBookCoverObjectKey({
    fileId: deps.idGenerator.createId(),
    fileType: input.fileType,
  });
  if (!objectKey) return fail('invalid_file_type');

  deps.logger.info('book.cover_upload.prepare', {
    event: 'book.cover_upload.prepare',
    fileType: input.fileType,
  });
  return ok({ objectKey });
}
