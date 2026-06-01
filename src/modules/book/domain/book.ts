import type {
  BookCoverObjectKey,
  BookId,
  GenreId,
} from '@/modules/kernel/domain/ids';
import { toBookCoverObjectKey } from '@/modules/kernel/domain/ids';

export type BookGenreSummary = {
  id: GenreId;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Book = {
  id: BookId;
  title: string;
  author: string;
  genreId: GenreId;
  genre: BookGenreSummary | null;
  publisher: string | null;
  coverId: BookCoverObjectKey | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BookWriteInput = {
  title: string;
  author: string;
  genreId: GenreId;
  publisher?: string | null;
  coverId?: BookCoverObjectKey | null;
};

export type BookListPage = {
  items: Book[];
  nextCursor?: BookId;
  total: number;
};

export function normalizeBookWriteInput(input: BookWriteInput): BookWriteInput {
  const coverId = input.coverId?.trim();

  return {
    title: input.title.trim(),
    author: input.author.trim(),
    genreId: input.genreId,
    publisher: input.publisher?.trim() || null,
    coverId: coverId ? toBookCoverObjectKey(coverId) : null,
  };
}
