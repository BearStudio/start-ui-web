import type {
  BookCoverObjectKey,
  GeneratedId,
} from '@/modules/kernel/domain/ids';
import { toBookCoverObjectKey } from '@/modules/kernel/domain/ids';

import type { BookWriteInput } from './book';

export const bookCoverAcceptedFileTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

export const bookCoverMaxFileSizeBytes = 1024 * 1024 * 10;

type BookCoverAcceptedFileType = (typeof bookCoverAcceptedFileTypes)[number];

const bookCoverFileExtensionsByType: Record<BookCoverAcceptedFileType, string> =
  {
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

const isBookCoverAcceptedFileType = (
  fileType: string
): fileType is BookCoverAcceptedFileType =>
  Object.hasOwn(bookCoverFileExtensionsByType, fileType);

export const getBookCoverFileExtension = (fileType: string) =>
  isBookCoverAcceptedFileType(fileType)
    ? bookCoverFileExtensionsByType[fileType]
    : null;

export const createBookCoverObjectKey = (input: {
  fileId: GeneratedId;
  fileType: string;
}): BookCoverObjectKey | null => {
  const extension = getBookCoverFileExtension(input.fileType);
  if (!extension) return null;
  return toBookCoverObjectKey(`books/${input.fileId}.${extension}`);
};

export function isDuplicateBookCandidate(
  left: Pick<BookWriteInput, 'title' | 'author'>,
  right: Pick<BookWriteInput, 'title' | 'author'>
) {
  return (
    left.title.trim().toLowerCase() === right.title.trim().toLowerCase() &&
    left.author.trim().toLowerCase() === right.author.trim().toLowerCase()
  );
}
