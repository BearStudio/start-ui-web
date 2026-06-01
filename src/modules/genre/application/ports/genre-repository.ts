import type { ApplicationResult } from '@/modules/kernel/application/result';
import type { GenreId } from '@/modules/kernel/domain/ids';

import type { GenreListPage } from '../../domain/genre';

export type GenreListRepositoryOutcome = {
  type: 'genre_listed';
  page: GenreListPage;
};

export interface GenreRepository {
  list(input: {
    cursor?: GenreId;
    limit: number;
    searchTerm: string;
  }): Promise<ApplicationResult<GenreListRepositoryOutcome>>;
}
