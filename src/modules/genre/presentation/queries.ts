import { queryOptions } from '@tanstack/react-query';

import { genreGetAll } from '../server';

type GetAllInput = {
  searchTerm?: string;
  cursor?: string;
  limit?: number;
};

type ScopedQueryInput = {
  scopeKey: string;
};

export const genreQueries = {
  all: () => ['genre'] as const,
  getAll: (scopeKey: string) =>
    [...genreQueries.all(), { scopeKey }, 'getAll'] as const,
  getAllList: (input: GetAllInput & ScopedQueryInput) => {
    const { scopeKey, ...norm } = input;
    return queryOptions({
      queryKey: [...genreQueries.getAll(scopeKey), norm] as const,
      queryFn: () => genreGetAll({ data: norm }),
    });
  },
};
