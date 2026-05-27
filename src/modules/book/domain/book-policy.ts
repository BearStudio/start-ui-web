import type { BookWriteInput } from './book';

export const bookCoverAcceptedFileTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

export const bookCoverMaxFileSizeBytes = 1024 * 1024 * 100;

const bookCoverFileExtensionsByType: Record<
  (typeof bookCoverAcceptedFileTypes)[number],
  string
> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const getBookCoverFileExtension = (fileType: string) =>
  bookCoverAcceptedFileTypes.includes(
    fileType as (typeof bookCoverAcceptedFileTypes)[number]
  )
    ? bookCoverFileExtensionsByType[
        fileType as (typeof bookCoverAcceptedFileTypes)[number]
      ]
    : null;

export const createBookCoverObjectKey = (input: {
  fileId: string;
  fileType: string;
}) => {
  const extension = getBookCoverFileExtension(input.fileType);
  if (!extension) return null;
  return `books/${input.fileId}.${extension}`;
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
