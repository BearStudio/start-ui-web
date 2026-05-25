import {
  infiniteQueryOptions,
  type MutationOptions,
  queryOptions,
} from '@tanstack/react-query';

import {
  bookCreate,
  bookDeleteById,
  bookGetAll,
  bookGetById,
  bookUpdateById,
} from '../server';

type GetAllInput = {
  searchTerm?: string;
  cursor?: string;
  limit?: number;
};

export type ScopedQueryInput = {
  scopeKey: string;
};

export const bookQueries = {
  all: () => ['book'] as const,
  getAll: (scopeKey: string) =>
    [...bookQueries.all(), { scopeKey }, 'getAll'] as const,
  getAllList: (input: GetAllInput & ScopedQueryInput) => {
    const { scopeKey, ...data } = input;
    return queryOptions({
      queryKey: [...bookQueries.getAll(scopeKey), data] as const,
      queryFn: () => bookGetAll({ data }),
    });
  },
  getAllInfinite: (input: Omit<GetAllInput, 'cursor'> & ScopedQueryInput) => {
    const { scopeKey, ...data } = input;
    return infiniteQueryOptions({
      queryKey: [...bookQueries.getAll(scopeKey), 'infinite', data] as const,
      queryFn: ({ pageParam }) =>
        bookGetAll({
          data: { ...data, cursor: pageParam },
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      maxPages: 10,
    });
  },
  getById: (input: { id: string } & ScopedQueryInput) => {
    const { scopeKey, ...data } = input;
    return queryOptions({
      queryKey: [...bookQueries.all(), { scopeKey }, 'getById', data] as const,
      queryFn: () => bookGetById({ data }),
    });
  },
  create: (): MutationOptions<
    Awaited<ReturnType<typeof bookCreate>>,
    Error,
    Parameters<typeof bookCreate>[0]['data']
  > => ({
    mutationKey: ['book', 'create'],
    mutationFn: (data) => bookCreate({ data }),
  }),
  updateById: (): MutationOptions<
    Awaited<ReturnType<typeof bookUpdateById>>,
    Error,
    Parameters<typeof bookUpdateById>[0]['data']
  > => ({
    mutationKey: ['book', 'updateById'],
    mutationFn: (data) => bookUpdateById({ data }),
  }),
  deleteById: (): MutationOptions<
    Awaited<ReturnType<typeof bookDeleteById>>,
    Error,
    Parameters<typeof bookDeleteById>[0]['data']
  > => ({
    mutationKey: ['book', 'deleteById'],
    mutationFn: (data) => bookDeleteById({ data }),
  }),
};
