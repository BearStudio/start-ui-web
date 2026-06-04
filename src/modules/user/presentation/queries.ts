import {
  scopedEntityQueryOptions,
  scopedInfiniteQueryOptions,
  scopedListQueryOptions,
  type ScopedQueryInput,
  serverMutationOptions,
} from '@/platform/lib/tanstack-query/scoped-query-options';
import type { ServerFunctionFacade } from '@/platform/lib/tanstack-start/server-function-types';

import type { ScopeKey, SessionId, UserId } from '@/modules/kernel/domain/ids';

import type { UserServerFunctions } from '../server';

type GetAllInput = {
  searchTerm?: string;
  cursor?: UserId;
  limit?: number;
};

export type UserQueryFacade = ServerFunctionFacade<
  Pick<
    UserServerFunctions,
    | 'userCreate'
    | 'userDeleteById'
    | 'userGetAll'
    | 'userGetById'
    | 'userGetUserSessions'
    | 'userRevokeUserSession'
    | 'userRevokeUserSessions'
    | 'userUpdateById'
  >
>;

const userQueryVersion = 'v1';

export const createUserQueries = <TFacade extends UserQueryFacade>(
  facade: TFacade
) => {
  const all = () => ['user', userQueryVersion] as const;
  const getAll = (scopeKey: ScopeKey) =>
    [...all(), { scopeKey }, 'getAll'] as const;
  const getByIdBaseKey = (scopeKey: ScopeKey) =>
    [...all(), { scopeKey }, 'getById'] as const;
  const getUserSessions = (scopeKey: ScopeKey) =>
    [...all(), { scopeKey }, 'getUserSessions'] as const;

  return {
    all,
    getAll,
    getAllList: (input: GetAllInput & ScopedQueryInput<ScopeKey>) =>
      scopedListQueryOptions({
        baseKey: getAll,
        input,
        queryFn: (data) => facade.userGetAll({ data }),
      }),
    getAllInfinite: (
      input: Omit<GetAllInput, 'cursor'> & ScopedQueryInput<ScopeKey>
    ) =>
      scopedInfiniteQueryOptions({
        baseKey: getAll,
        input,
        queryFn: (data, pageParam: UserId | undefined) =>
          facade.userGetAll({
            data: { ...data, cursor: pageParam },
          }),
      }),
    getById: (input: { id: UserId } & ScopedQueryInput<ScopeKey>) =>
      scopedEntityQueryOptions({
        baseKey: getByIdBaseKey,
        input,
        queryFn: (data) => facade.userGetById({ data }),
      }),
    getUserSessions,
    getUserSessionsInfinite: (
      input: { userId: UserId; limit?: number } & ScopedQueryInput<ScopeKey>
    ) =>
      scopedInfiniteQueryOptions({
        baseKey: getUserSessions,
        input,
        queryFn: (data, pageParam: SessionId | undefined) =>
          facade.userGetUserSessions({
            data: { ...data, cursor: pageParam, limit: data.limit ?? 20 },
          }),
      }),
    create: () =>
      serverMutationOptions({
        mutationKey: [...all(), 'create'],
        mutationFn: facade.userCreate,
      }),
    updateById: () =>
      serverMutationOptions({
        mutationKey: [...all(), 'updateById'],
        mutationFn: facade.userUpdateById,
      }),
    deleteById: () =>
      serverMutationOptions({
        mutationKey: [...all(), 'deleteById'],
        mutationFn: facade.userDeleteById,
      }),
    revokeUserSessions: () =>
      serverMutationOptions({
        mutationKey: [...all(), 'revokeUserSessions'],
        mutationFn: facade.userRevokeUserSessions,
      }),
    revokeUserSession: () =>
      serverMutationOptions({
        mutationKey: [...all(), 'revokeUserSession'],
        mutationFn: facade.userRevokeUserSession,
      }),
  };
};
