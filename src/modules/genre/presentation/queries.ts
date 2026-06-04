import {
  scopedListQueryOptions,
  type ScopedQueryInput,
} from '@/platform/lib/tanstack-query/scoped-query-options';
import type { ServerFunctionFacade } from '@/platform/lib/tanstack-start/server-function-types';

import type { GenreId, ScopeKey } from '@/modules/kernel/domain/ids';

import type { GenreServerFunctions } from '../server';

type GetAllInput = {
  searchTerm?: string;
  cursor?: GenreId;
  limit?: number;
};

export type GenreQueryFacade = ServerFunctionFacade<
  Pick<GenreServerFunctions, 'genreGetAll'>
>;

const genreQueryVersion = 'v1';

export const createGenreQueries = <TFacade extends GenreQueryFacade>(
  facade: TFacade
) => {
  const all = () => ['genre', genreQueryVersion] as const;
  const getAll = (scopeKey: ScopeKey) =>
    [...all(), { scopeKey }, 'getAll'] as const;

  return {
    all,
    getAll,
    getAllList: (input: GetAllInput & ScopedQueryInput<ScopeKey>) =>
      scopedListQueryOptions({
        baseKey: getAll,
        input,
        queryFn: (data) => facade.genreGetAll({ data }),
      }),
  };
};
