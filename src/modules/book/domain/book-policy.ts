import type { BookWriteInput } from './book';

export const bookCoverAcceptedFileTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

export function isDuplicateBookCandidate(
  left: Pick<BookWriteInput, 'title' | 'author'>,
  right: Pick<BookWriteInput, 'title' | 'author'>
) {
  return (
    left.title.trim().toLowerCase() === right.title.trim().toLowerCase() &&
    left.author.trim().toLowerCase() === right.author.trim().toLowerCase()
  );
}
