import {
  scopedEntityQueryOptions,
  scopedInfiniteQueryOptions,
  scopedListQueryOptions,
  type ScopedQueryInput,
  serverMutationOptions,
} from '@/platform/lib/tanstack-query/scoped-query-options';

import {
  bookCreate,
  bookDeleteById,
  bookGetAll,
  bookGetById,
  bookUpdateById,
} from '../server-functions';

type GetAllInput = {
  searchTerm?: string;
  cursor?: string;
  limit?: number;
};

export const bookQueries = {
  all: () => ['book'] as const,
  getAll: (scopeKey: string) =>
    [...bookQueries.all(), { scopeKey }, 'getAll'] as const,
  getAllList: (input: GetAllInput & ScopedQueryInput) =>
    scopedListQueryOptions({
      baseKey: bookQueries.getAll,
      input,
      queryFn: (data) => bookGetAll({ data }),
    }),
  getAllInfinite: (input: Omit<GetAllInput, 'cursor'> & ScopedQueryInput) =>
    scopedInfiniteQueryOptions({
      baseKey: bookQueries.getAll,
      input,
      queryFn: (data, pageParam: string | undefined) =>
        bookGetAll({
          data: { ...data, cursor: pageParam },
        }),
    }),
  getById: (input: { id: string } & ScopedQueryInput) =>
    scopedEntityQueryOptions({
      baseKey: (scopeKey) =>
        [...bookQueries.all(), { scopeKey }, 'getById'] as const,
      input,
      queryFn: (data) => bookGetById({ data }),
    }),
  create: () =>
    serverMutationOptions({
      mutationKey: ['book', 'create'],
      mutationFn: bookCreate,
    }),
  updateById: () =>
    serverMutationOptions({
      mutationKey: ['book', 'updateById'],
      mutationFn: bookUpdateById,
    }),
  deleteById: () =>
    serverMutationOptions({
      mutationKey: ['book', 'deleteById'],
      mutationFn: bookDeleteById,
    }),
};
