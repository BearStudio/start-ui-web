import type { GenreId } from '@/modules/kernel/domain/ids';

import type { GenreListPage } from '../../domain/genre';

export interface GenreRepository {
  list(input: {
    cursor?: GenreId;
    limit: number;
    searchTerm: string;
  }): Promise<GenreListPage>;
}
