import { RejectUpload, route } from '@better-upload/server';
import { Result } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

import i18n from '@/platform/lib/i18n';

import type { AuthSession } from '@/modules/auth';
import type { BookUseCases } from '@/modules/book';
import type { Logger } from '@/modules/kernel';

import {
  bookCoverAcceptedFileTypes,
  bookCoverMaxFileSizeBytes,
} from '../../domain/book-policy';

type BookCoverUploadDeps = {
  getCurrentSession: (headers: Headers) => Promise<AuthSession | null>;
  getUseCases: () => Pick<BookUseCases, 'prepareCoverUpload'>;
  logger?: Pick<Logger, 'warn'>;
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

export const bookCoverUploadConstraints = {
  fileTypes: [...bookCoverAcceptedFileTypes] as string[],
  maxFileSize: bookCoverMaxFileSizeBytes,
} as const;

const rejectUpload = (
  deps: Pick<BookCoverUploadDeps, 'logger'>,
  key: BookCoverUploadErrorKey,
  fileType: string
): never => {
  deps.logger?.warn({
    details: {
      fileType,
      reason: key,
    },
    event: 'security.upload_rejected',
  });
  throw new RejectUpload(i18n.t(uploadErrorTranslationKeys[key]));
};

export const handleBookCoverBeforeUpload = async (
  deps: BookCoverUploadDeps,
  input: { headers: Headers; fileType: string }
): Promise<BookCoverBeforeUploadResult> => {
  const session = await deps.getCurrentSession(input.headers);
  const user =
    session?.user ?? rejectUpload(deps, 'NOT_AUTHENTICATED', input.fileType);

  const prepared = await deps.getUseCases().prepareCoverUpload({
    currentUserId: user.id,
    fileType: input.fileType,
  });

  return match(prepared)
    .with(Result.P.Error(P.select()), (error) => {
      throw error;
    })
    .with(
      Result.P.Ok({
        type: 'book_cover_upload_prepared',
        upload: P.select(),
      }),
      (upload) => ({
        objectInfo: {
          key: upload.objectKey,
        },
      })
    )
    .with(Result.P.Ok({ type: 'book_cover_upload_forbidden' }), () =>
      rejectUpload(deps, 'UNAUTHORIZED', input.fileType)
    )
    .with(Result.P.Ok({ type: 'book_cover_upload_invalid_file_type' }), () =>
      rejectUpload(deps, 'invalid_file_type', input.fileType)
    )
    .exhaustive();
};

export const createBookCoverUploadRoute = (deps: BookCoverUploadDeps) =>
  route({
    ...bookCoverUploadConstraints,
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
