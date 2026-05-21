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
} from '../transport/tanstack/book-server-functions';

type GetAllInput = {
  searchTerm?: string;
  cursor?: string;
  limit?: number;
};

export const bookQueries = {
  all: () => ['book'] as const,
  getAll: () => [...bookQueries.all(), 'getAll'] as const,
  getAllList: (input?: GetAllInput) =>
    queryOptions({
      queryKey: [...bookQueries.getAll(), input ?? {}] as const,
      queryFn: () => bookGetAll({ data: input }),
    }),
  getAllInfinite: (input?: Omit<GetAllInput, 'cursor'>) =>
    infiniteQueryOptions({
      queryKey: [...bookQueries.getAll(), 'infinite', input ?? {}] as const,
      queryFn: ({ pageParam }) =>
        bookGetAll({
          data: { ...input, cursor: pageParam },
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      maxPages: 10,
    }),
  getById: (input: { id: string }) =>
    queryOptions({
      queryKey: [...bookQueries.all(), 'getById', input] as const,
      queryFn: () => bookGetById({ data: input }),
    }),
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
