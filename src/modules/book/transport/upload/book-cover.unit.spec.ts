import { RejectUpload } from '@better-upload/server';
import { describe, expect, it, vi } from 'vitest';

import { mockSession, mockUser } from '@/tests/server/test-utils';

import {
  bookCoverUploadConstraints,
  handleBookCoverBeforeUpload,
} from './book-cover';
import {
  bookCoverAcceptedFileTypes,
  bookCoverMaxFileSizeBytes,
} from '../../domain/book-policy';

const headers = new Headers();

describe('book cover upload transport', () => {
  it('keeps upload route limits server-side', () => {
    expect(bookCoverUploadConstraints.maxFileSize).toBe(
      bookCoverMaxFileSizeBytes
    );
    expect(bookCoverUploadConstraints.fileTypes).toEqual([
      ...bookCoverAcceptedFileTypes,
    ]);
  });

  it('binds session context and returns the prepared object key', async () => {
    const prepareCoverUpload = vi.fn(async () => ({
      ok: true as const,
      value: { objectKey: 'books/generated.webp' },
    }));

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
      scope: {
        userId: mockUser.id,
        role: mockUser.role,
      },
      fileType: 'image/webp',
    });
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
            prepareCoverUpload: async () => ({
              ok: false as const,
              reason: 'forbidden' as const,
            }),
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
            prepareCoverUpload: async () => ({
              ok: false as const,
              reason: 'invalid_file_type' as const,
            }),
          }),
        },
        { headers, fileType: 'text/plain' }
      )
    ).rejects.toBeInstanceOf(RejectUpload);
  });
});
