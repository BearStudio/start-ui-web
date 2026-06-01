import {
  scopedEntityQueryOptions,
  scopedInfiniteQueryOptions,
  scopedListQueryOptions,
  type ScopedQueryInput,
  serverMutationOptions,
} from '@/platform/lib/tanstack-query/scoped-query-options';
import type { BookId, ScopeKey } from '@/modules/kernel/domain/ids';

import {
  bookCreate,
  bookDeleteById,
  bookGetAll,
  bookGetById,
  bookUpdateById,
} from '../server';

type GetAllInput = {
  searchTerm?: string;
  cursor?: BookId;
  limit?: number;
};

export const bookQueries = {
  all: () => ['book'] as const,
  getAll: (scopeKey: ScopeKey) =>
    [...bookQueries.all(), { scopeKey }, 'getAll'] as const,
  getAllList: (input: GetAllInput & ScopedQueryInput<ScopeKey>) =>
    scopedListQueryOptions({
      baseKey: bookQueries.getAll,
      input,
      queryFn: (data) => bookGetAll({ data }),
    }),
  getAllInfinite: (
    input: Omit<GetAllInput, 'cursor'> & ScopedQueryInput<ScopeKey>
  ) =>
    scopedInfiniteQueryOptions({
      baseKey: bookQueries.getAll,
      input,
      queryFn: (data, pageParam: BookId | undefined) =>
        bookGetAll({
          data: { ...data, cursor: pageParam },
        }),
    }),
  getById: (input: { id: BookId } & ScopedQueryInput<ScopeKey>) =>
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
