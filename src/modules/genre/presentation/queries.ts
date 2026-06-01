import {
  scopedListQueryOptions,
  type ScopedQueryInput,
} from '@/platform/lib/tanstack-query/scoped-query-options';
import type { GenreId, ScopeKey } from '@/modules/kernel/domain/ids';

import { genreGetAll } from '../server';

type GetAllInput = {
  searchTerm?: string;
  cursor?: GenreId;
  limit?: number;
};

export const genreQueries = {
  all: () => ['genre'] as const,
  getAll: (scopeKey: ScopeKey) =>
    [...genreQueries.all(), { scopeKey }, 'getAll'] as const,
  getAllList: (input: GetAllInput & ScopedQueryInput<ScopeKey>) =>
    scopedListQueryOptions({
      baseKey: genreQueries.getAll,
      input,
      queryFn: (data) => genreGetAll({ data }),
    }),
};
