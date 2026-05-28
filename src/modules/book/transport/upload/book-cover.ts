import { RejectUpload, route } from '@better-upload/server';

import i18n from '@/platform/lib/i18n';

import { type AuthSession, scopeFromUser } from '@/modules/auth';
import type { BookUseCases } from '@/modules/book';

import {
  bookCoverAcceptedFileTypes,
  bookCoverMaxFileSizeBytes,
} from '../../domain/book-policy';

type BookCoverUploadDeps = {
  getCurrentSession: (headers: Headers) => Promise<AuthSession | null>;
  getUseCases: () => Pick<BookUseCases, 'prepareCoverUpload'>;
};

type BookCoverUploadErrorKey =
  | 'NOT_AUTHENTICATED'
  | 'UNAUTHORIZED'
  | 'invalid_file_type';

type BookCoverBeforeUploadResult = {
  objectInfo: {
    key: string;
  };
};

const uploadErrorTranslationKeys = {
  NOT_AUTHENTICATED: 'book:manager.uploadErrors.NOT_AUTHENTICATED',
  UNAUTHORIZED: 'book:manager.uploadErrors.UNAUTHORIZED',
  invalid_file_type: 'book:manager.uploadErrors.invalid_file_type',
} as const satisfies Record<BookCoverUploadErrorKey, string>;

const rejectUpload = (key: BookCoverUploadErrorKey): never => {
  throw new RejectUpload(i18n.t(uploadErrorTranslationKeys[key]));
};

export const handleBookCoverBeforeUpload = async (
  deps: BookCoverUploadDeps,
  input: { headers: Headers; fileType: string }
): Promise<BookCoverBeforeUploadResult> => {
  const session = await deps.getCurrentSession(input.headers);
  const user = session?.user ?? rejectUpload('NOT_AUTHENTICATED');

  const prepared = await deps.getUseCases().prepareCoverUpload({
    scope: scopeFromUser(user),
    fileType: input.fileType,
  });

  if (prepared.ok) {
    return {
      objectInfo: {
        key: prepared.value.objectKey,
      },
    };
  }

  if (prepared.reason === 'forbidden') {
    return rejectUpload('UNAUTHORIZED');
  }
  return rejectUpload('invalid_file_type');
};

export const createBookCoverUploadRoute = (deps: BookCoverUploadDeps) =>
  route({
    fileTypes: [...bookCoverAcceptedFileTypes],
    maxFileSize: bookCoverMaxFileSizeBytes,
    onBeforeUpload: async ({ req, file }) => {
      return handleBookCoverBeforeUpload(deps, {
        headers: req.headers,
        fileType: file.type,
      });
    },
  });

export type BookCoverUploadRoute = ReturnType<
  typeof createBookCoverUploadRoute
>;
