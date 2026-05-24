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

export const userQueries = {
  all: () => ['user'] as const,
  getAll: () => [...userQueries.all(), 'getAll'] as const,
  getAllList: (input?: GetAllInput) =>
    queryOptions({
      queryKey: [...userQueries.getAll(), input ?? {}] as const,
      queryFn: () => userGetAll({ data: input }),
    }),
  getAllInfinite: (input?: Omit<GetAllInput, 'cursor'>) =>
    infiniteQueryOptions({
      queryKey: [...userQueries.getAll(), 'infinite', input ?? {}] as const,
      queryFn: ({ pageParam }) =>
        userGetAll({
          data: { ...input, cursor: pageParam },
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      maxPages: 10,
    }),
  getById: (input: { id: string }) =>
    queryOptions({
      queryKey: [...userQueries.all(), 'getById', input] as const,
      queryFn: () => userGetById({ data: input }),
    }),
  getUserSessions: () => ['user', 'getUserSessions'] as const,
  getUserSessionsInfinite: (input: { userId: string; limit?: number }) =>
    infiniteQueryOptions({
      queryKey: [...userQueries.getUserSessions(), 'infinite', input] as const,
      queryFn: ({ pageParam }) =>
        userGetUserSessions({
          data: { ...input, cursor: pageParam, limit: input.limit ?? 20 },
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      maxPages: 10,
    }),
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
