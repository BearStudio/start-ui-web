import type { BookWriteInput } from './book';

export function isDuplicateBookCandidate(
  left: Pick<BookWriteInput, 'title' | 'author'>,
  right: Pick<BookWriteInput, 'title' | 'author'>
) {
  return (
    left.title.trim().toLocaleLowerCase() ===
      right.title.trim().toLocaleLowerCase() &&
    left.author.trim().toLocaleLowerCase() ===
      right.author.trim().toLocaleLowerCase()
  );
}
