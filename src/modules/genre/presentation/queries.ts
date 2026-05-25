import {
  scopedListQueryOptions,
  type ScopedQueryInput,
} from '@/platform/lib/tanstack-query/scoped-query-options';

import { genreGetAll } from '../server';

type GetAllInput = {
  searchTerm?: string;
  cursor?: string;
  limit?: number;
};

export const genreQueries = {
  all: () => ['genre'] as const,
  getAll: (scopeKey: string) =>
    [...genreQueries.all(), { scopeKey }, 'getAll'] as const,
  getAllList: (input: GetAllInput & ScopedQueryInput) =>
    scopedListQueryOptions({
      baseKey: genreQueries.getAll,
      input,
      queryFn: (data) => genreGetAll({ data }),
    }),
};
