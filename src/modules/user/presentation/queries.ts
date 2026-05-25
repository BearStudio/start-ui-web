import {
  infiniteQueryOptions,
  type MutationOptions,
  queryOptions,
} from '@tanstack/react-query';

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
  cursor?: string;
  limit?: number;
};

export type ScopedQueryInput = {
  scopeKey: string;
};

export const userQueries = {
  all: () => ['user'] as const,
  getAll: (scopeKey: string) =>
    [...userQueries.all(), { scopeKey }, 'getAll'] as const,
  getAllList: (input: GetAllInput & ScopedQueryInput) => {
    const { scopeKey, ...data } = input;
    return queryOptions({
      queryKey: [...userQueries.getAll(scopeKey), data] as const,
      queryFn: () => userGetAll({ data }),
    });
  },
  getAllInfinite: (input: Omit<GetAllInput, 'cursor'> & ScopedQueryInput) => {
    const { scopeKey, ...data } = input;
    return infiniteQueryOptions({
      queryKey: [...userQueries.getAll(scopeKey), 'infinite', data] as const,
      queryFn: ({ pageParam }) =>
        userGetAll({
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
      queryKey: [...userQueries.all(), { scopeKey }, 'getById', data] as const,
      queryFn: () => userGetById({ data }),
    });
  },
  getUserSessions: (scopeKey: string) =>
    ['user', { scopeKey }, 'getUserSessions'] as const,
  getUserSessionsInfinite: (
    input: { userId: string; limit?: number } & ScopedQueryInput
  ) => {
    const { scopeKey, ...data } = input;
    return infiniteQueryOptions({
      queryKey: [...userQueries.getUserSessions(scopeKey), 'infinite', data],
      queryFn: ({ pageParam }) =>
        userGetUserSessions({
          data: { ...data, cursor: pageParam, limit: data.limit ?? 20 },
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      maxPages: 10,
    });
  },
  create: (): MutationOptions<
    Awaited<ReturnType<typeof userCreate>>,
    Error,
    Parameters<typeof userCreate>[0]['data']
  > => ({
    mutationKey: ['user', 'create'],
    mutationFn: (data) => userCreate({ data }),
  }),
  updateById: (): MutationOptions<
    Awaited<ReturnType<typeof userUpdateById>>,
    Error,
    Parameters<typeof userUpdateById>[0]['data']
  > => ({
    mutationKey: ['user', 'updateById'],
    mutationFn: (data) => userUpdateById({ data }),
  }),
  deleteById: (): MutationOptions<
    Awaited<ReturnType<typeof userDeleteById>>,
    Error,
    Parameters<typeof userDeleteById>[0]['data']
  > => ({
    mutationKey: ['user', 'deleteById'],
    mutationFn: (data) => userDeleteById({ data }),
  }),
  revokeUserSessions: (): MutationOptions<
    Awaited<ReturnType<typeof userRevokeUserSessions>>,
    Error,
    Parameters<typeof userRevokeUserSessions>[0]['data']
  > => ({
    mutationKey: ['user', 'revokeUserSessions'],
    mutationFn: (data) => userRevokeUserSessions({ data }),
  }),
  revokeUserSession: (): MutationOptions<
    Awaited<ReturnType<typeof userRevokeUserSession>>,
    Error,
    Parameters<typeof userRevokeUserSession>[0]['data']
  > => ({
    mutationKey: ['user', 'revokeUserSession'],
    mutationFn: (data) => userRevokeUserSession({ data }),
  }),
};
