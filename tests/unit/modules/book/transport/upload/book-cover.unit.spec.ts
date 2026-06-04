import { RejectUpload } from '@better-upload/server';
import { Result } from '@swan-io/boxed';
import { mockSession, mockUser } from '@tests/server/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bookCoverAcceptedFileTypes,
  bookCoverMaxFileSizeBytes,
} from '@/modules/book/domain/book-policy';
import {
  bookCoverUploadConstraints,
  handleBookCoverBeforeUpload,
} from '@/modules/book/transport/upload/book-cover';
import { toBookCoverObjectKey } from '@/modules/kernel/testing';

const headers = new Headers();

const telemetryMock = vi.hoisted(() => ({
  startSpan: vi.fn((_options: unknown, fn: () => unknown) => fn()),
}));

vi.mock('@/platform/telemetry', () => ({
  getTelemetry: () => telemetryMock,
}));

describe('book cover upload transport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps upload route limits server-side', () => {
    expect(bookCoverUploadConstraints.maxFileSize).toBe(
      bookCoverMaxFileSizeBytes
    );
    expect(bookCoverUploadConstraints.fileTypes).toEqual([
      ...bookCoverAcceptedFileTypes,
    ]);
  });

  it('binds session context and returns the prepared object key', async () => {
    const prepareCoverUpload = vi.fn(async () =>
      Result.Ok({
        type: 'book_cover_upload_prepared' as const,
        upload: { objectKey: toBookCoverObjectKey('books/generated.webp') },
      })
    );

    await expect(
      handleBookCoverBeforeUpload(
        {
          getCurrentSession: async () => ({
            user: mockUser,
            session: mockSession,
          }),
          getUseCases: () => ({ prepareCoverUpload }),
        },
        { headers, fileType: 'image/webp' }
      )
    ).resolves.toEqual({
      objectInfo: { key: 'books/generated.webp' },
    });

    expect(prepareCoverUpload).toHaveBeenCalledWith({
      currentUserId: mockUser.id,
      fileType: 'image/webp',
    });
    expect(telemetryMock.startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'file.mime_type': 'image/webp',
          'operation.name': 'book.coverUpload.beforeUpload',
          'upload.route': 'bookCover',
        }),
        name: 'book.coverUpload.beforeUpload',
        op: 'upload.before_upload',
      }),
      expect.any(Function)
    );
  });

  it('maps unauthenticated users to a rejected upload', async () => {
    await expect(
      handleBookCoverBeforeUpload(
        {
          getCurrentSession: async () => null,
          getUseCases: () => ({ prepareCoverUpload: vi.fn() }),
        },
        { headers, fileType: 'image/png' }
      )
    ).rejects.toBeInstanceOf(RejectUpload);
  });

  it('maps expected use-case failures to rejected uploads', async () => {
    await expect(
      handleBookCoverBeforeUpload(
        {
          getCurrentSession: async () => ({
            user: mockUser,
            session: mockSession,
          }),
          getUseCases: () => ({
            prepareCoverUpload: async () =>
              Result.Ok({ type: 'book_cover_upload_forbidden' as const }),
          }),
        },
        { headers, fileType: 'image/png' }
      )
    ).rejects.toBeInstanceOf(RejectUpload);

    await expect(
      handleBookCoverBeforeUpload(
        {
          getCurrentSession: async () => ({
            user: mockUser,
            session: mockSession,
          }),
          getUseCases: () => ({
            prepareCoverUpload: async () =>
              Result.Ok({
                type: 'book_cover_upload_invalid_file_type' as const,
              }),
          }),
        },
        { headers, fileType: 'text/plain' }
      )
    ).rejects.toBeInstanceOf(RejectUpload);
  });
});
