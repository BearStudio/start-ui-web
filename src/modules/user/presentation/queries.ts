import {
  scopedEntityQueryOptions,
  scopedInfiniteQueryOptions,
  scopedListQueryOptions,
  type ScopedQueryInput,
  serverMutationOptions,
} from '@/platform/lib/tanstack-query/scoped-query-options';

import type { ScopeKey, SessionId, UserId } from '@/modules/kernel/domain/ids';

import {
  userCreate,
  userDeleteById,
  userGetAll,
  userGetById,
  userGetUserSessions,
  userRevokeUserSession,
  userRevokeUserSessions,
  userUpdateById,
} from '../server';

type GetAllInput = {
  searchTerm?: string;
  cursor?: UserId;
  limit?: number;
};

const userQueryVersion = 'v1';

export const userQueries = {
  all: () => ['user', userQueryVersion] as const,
  getAll: (scopeKey: ScopeKey) =>
    [...userQueries.all(), { scopeKey }, 'getAll'] as const,
  getAllList: (input: GetAllInput & ScopedQueryInput<ScopeKey>) =>
    scopedListQueryOptions({
      baseKey: userQueries.getAll,
      input,
      queryFn: (data) => userGetAll({ data }),
    }),
  getAllInfinite: (
    input: Omit<GetAllInput, 'cursor'> & ScopedQueryInput<ScopeKey>
  ) =>
    scopedInfiniteQueryOptions({
      baseKey: userQueries.getAll,
      input,
      queryFn: (data, pageParam: UserId | undefined) =>
        userGetAll({
          data: { ...data, cursor: pageParam },
        }),
    }),
  getById: (input: { id: UserId } & ScopedQueryInput<ScopeKey>) =>
    scopedEntityQueryOptions({
      baseKey: (scopeKey) =>
        [...userQueries.all(), { scopeKey }, 'getById'] as const,
      input,
      queryFn: (data) => userGetById({ data }),
    }),
  getUserSessions: (scopeKey: ScopeKey) =>
    [...userQueries.all(), { scopeKey }, 'getUserSessions'] as const,
  getUserSessionsInfinite: (
    input: { userId: UserId; limit?: number } & ScopedQueryInput<ScopeKey>
  ) =>
    scopedInfiniteQueryOptions({
      baseKey: userQueries.getUserSessions,
      input,
      queryFn: (data, pageParam: SessionId | undefined) =>
        userGetUserSessions({
          data: { ...data, cursor: pageParam, limit: data.limit ?? 20 },
        }),
    }),
  create: () =>
    serverMutationOptions({
      mutationKey: ['user', userQueryVersion, 'create'],
      mutationFn: userCreate,
    }),
  updateById: () =>
    serverMutationOptions({
      mutationKey: ['user', userQueryVersion, 'updateById'],
      mutationFn: userUpdateById,
    }),
  deleteById: () =>
    serverMutationOptions({
      mutationKey: ['user', userQueryVersion, 'deleteById'],
      mutationFn: userDeleteById,
    }),
  revokeUserSessions: () =>
    serverMutationOptions({
      mutationKey: ['user', userQueryVersion, 'revokeUserSessions'],
      mutationFn: userRevokeUserSessions,
    }),
  revokeUserSession: () =>
    serverMutationOptions({
      mutationKey: ['user', userQueryVersion, 'revokeUserSession'],
      mutationFn: userRevokeUserSession,
    }),
};
