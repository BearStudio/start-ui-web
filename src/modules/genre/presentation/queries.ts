import { queryOptions } from '@tanstack/react-query';

import { genreGetAll } from '../transport/tanstack/genre-server-functions';

type GetAllInput = {
  searchTerm?: string;
  cursor?: string;
  limit?: number;
};

export const genreQueries = {
  all: () => ['genre'] as const,
  getAll: () => [...genreQueries.all(), 'getAll'] as const,
  getAllList: (input?: GetAllInput) => {
    const norm = input ?? {};
    return queryOptions({
      queryKey: [...genreQueries.getAll(), norm] as const,
      queryFn: () => genreGetAll({ data: norm }),
    });
  },
};
