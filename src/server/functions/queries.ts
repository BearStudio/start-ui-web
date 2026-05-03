import {
  infiniteQueryOptions,
  type MutationOptions,
  queryOptions,
} from '@tanstack/react-query';

import {
  accountSubmitOnboarding,
  accountUpdateInfo,
} from '@/server/functions/account';
import {
  bookCreate,
  bookDeleteById,
  bookGetAll,
  bookGetById,
  bookUpdateById,
} from '@/server/functions/book';
import { configDevtools, configEnv } from '@/server/functions/config';
import { genreGetAll } from '@/server/functions/genre';
import {
  userCreate,
  userDeleteById,
  userGetAll,
  userGetById,
  userGetUserSessions,
  userRevokeUserSession,
  userRevokeUserSessions,
  userUpdateById,
} from '@/server/functions/user';

type GetAllInput = {
  searchTerm?: string;
  cursor?: string;
  limit?: number;
};

export const accountQueries = {
  submitOnboarding: (): MutationOptions<
    Awaited<ReturnType<typeof accountSubmitOnboarding>>,
    Error,
    Parameters<typeof accountSubmitOnboarding>[0]['data']
  > => ({
    mutationKey: ['account', 'submitOnboarding'],
    mutationFn: (data) => accountSubmitOnboarding({ data }),
  }),
  updateInfo: (): MutationOptions<
    Awaited<ReturnType<typeof accountUpdateInfo>>,
    Error,
    Parameters<typeof accountUpdateInfo>[0]['data']
  > => ({
    mutationKey: ['account', 'updateInfo'],
    mutationFn: (data) => accountUpdateInfo({ data }),
  }),
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

export const genreQueries = {
  all: () => ['genre'] as const,
  getAll: () => [...genreQueries.all(), 'getAll'] as const,
  getAllList: (input?: GetAllInput) =>
    queryOptions({
      queryKey: [...genreQueries.getAll(), input ?? {}] as const,
      queryFn: () => genreGetAll({ data: input }),
    }),
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

export const configQueries = {
  env: () =>
    queryOptions({
      queryKey: ['config', 'env'] as const,
      queryFn: () => configEnv(),
    }),
  devtools: () =>
    queryOptions({
      queryKey: ['config', 'devtools'] as const,
      queryFn: () => configDevtools(),
    }),
};
