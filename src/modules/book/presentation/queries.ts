import {
  scopedEntityQueryOptions,
  scopedInfiniteQueryOptions,
  scopedListQueryOptions,
  type ScopedQueryInput,
  serverMutationOptions,
} from '@/platform/lib/tanstack-query/scoped-query-options';
import type { ServerFunctionFacade } from '@/platform/lib/tanstack-start/server-function-types';

import type { BookId, ScopeKey } from '@/modules/kernel/domain/ids';

import type { BookServerFunctions } from '../server';

type GetAllInput = {
  searchTerm?: string;
  cursor?: BookId;
  limit?: number;
};

export type BookQueryFacade = ServerFunctionFacade<
  Pick<
    BookServerFunctions,
    | 'bookCreate'
    | 'bookDeleteById'
    | 'bookGetAll'
    | 'bookGetById'
    | 'bookUpdateById'
  >
>;

const bookQueryVersion = 'v1';

export const createBookQueries = <TFacade extends BookQueryFacade>(
  facade: TFacade
) => {
  const all = () => ['book', bookQueryVersion] as const;
  const getAll = (scopeKey: ScopeKey) =>
    [...all(), { scopeKey }, 'getAll'] as const;
  const getByIdBaseKey = (scopeKey: ScopeKey) =>
    [...all(), { scopeKey }, 'getById'] as const;

  return {
    all,
    getAll,
    getAllList: (input: GetAllInput & ScopedQueryInput<ScopeKey>) =>
      scopedListQueryOptions({
        baseKey: getAll,
        input,
        queryFn: (data) => facade.bookGetAll({ data }),
      }),
    getAllInfinite: (
      input: Omit<GetAllInput, 'cursor'> & ScopedQueryInput<ScopeKey>
    ) =>
      scopedInfiniteQueryOptions({
        baseKey: getAll,
        input,
        queryFn: (data, pageParam: BookId | undefined) =>
          facade.bookGetAll({
            data: { ...data, cursor: pageParam },
          }),
      }),
    getById: (input: { id: BookId } & ScopedQueryInput<ScopeKey>) =>
      scopedEntityQueryOptions({
        baseKey: getByIdBaseKey,
        input,
        queryFn: (data) => facade.bookGetById({ data }),
      }),
    create: () =>
      serverMutationOptions({
        mutationKey: ['book', bookQueryVersion, 'create'],
        mutationFn: facade.bookCreate,
      }),
    updateById: () =>
      serverMutationOptions({
        mutationKey: ['book', bookQueryVersion, 'updateById'],
        mutationFn: facade.bookUpdateById,
      }),
    deleteById: () =>
      serverMutationOptions({
        mutationKey: ['book', bookQueryVersion, 'deleteById'],
        mutationFn: facade.bookDeleteById,
      }),
  };
};
