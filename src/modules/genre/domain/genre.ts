import type { GenreId } from '@/modules/kernel/domain/ids';

export type Genre = {
  id: GenreId;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GenreListPage = {
  items: Genre[];
  nextCursor?: GenreId;
  total: number;
};

export function normalizeGenreSearchTerm(searchTerm: string | undefined) {
  return searchTerm?.trim() ?? '';
}
