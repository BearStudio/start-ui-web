import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQueryClient } from '@tanstack/react-query';
import { ClientInferRequest } from '@ts-rest/core';
import {
  UseMutationOptions,
  UseQueryOptions,
  useTsRestQueryClient,
} from '@ts-rest/react-query';
import { z } from 'zod';

import { client } from '@/api/client';
import { Contract, contract } from '@/api/contract';

const usersKeys = createQueryKeys('usersService', {
  users: (params: ClientInferRequest<Contract['users']['getAll']>['query']) => [
    params,
  ],
  user: (params: { login?: string }) => [params],
  userForm: null,
});

export const useUserList = (
  {
    page = 0,
    size = 20,
    sort = ['id', 'desc'],
  }: ClientInferRequest<Contract['users']['getAll']>['query'] = {},
  options: UseQueryOptions<Contract['users']['getAll']> = {}
) => {
  const params = { page, size, sort };
  const query = client.users.getAll.useQuery(
    usersKeys.users(params).queryKey,
    { query: params },
    {
      keepPreviousData: true,
      ...options,
    }
  );

  const totalItems =
    z.coerce
      .number()
      .optional()
      .catch(0)
      .parse(query.data?.headers.get('x-total-count')) ?? 0;
  const totalPages = Math.ceil(totalItems / params.size);
  const hasMore = params.page + 1 < totalPages;

  return {
    totalItems,
    hasMore,
    totalPages,
    ...query,
  };
};

export const useUser = (
  userLogin?: string,
  options: UseQueryOptions<Contract['users']['getByLogin']> = {}
) => {
  return client.users.getByLogin.useQuery(
    options.queryKey ?? usersKeys.user({ login: userLogin }).queryKey,
    { params: { login: userLogin ?? '' } },
    {
      enabled: !!userLogin,
      ...options,
    }
  );
};

export const useUserFormQuery = (
  userLogin?: string,
  options: UseQueryOptions<typeof contract.account.get> = {}
) =>
  useUser(userLogin, {
    queryKey: usersKeys.userForm.queryKey,
    staleTime: Infinity,
    cacheTime: 0,
    ...options,
  });

export const useUserUpdate = (
  options: UseMutationOptions<Contract['users']['update'], typeof client> = {}
) => {
  const queryClient = useQueryClient();
  const apiQueryClient = useTsRestQueryClient(client);
  return client.users.update.useMutation({
    ...options,
    onSuccess: (data, payload, ...args) => {
      queryClient.cancelQueries(usersKeys.users._def);
      queryClient
        .getQueryCache()
        .findAll(usersKeys.users._def)
        .forEach(({ queryKey }) => {
          apiQueryClient.users.getAll.setQueryData(queryKey, (cachedData) => {
            if (!cachedData) return;
            return {
              ...cachedData,
              content: (cachedData.body || []).map((user) =>
                user.id === data.body.id ? data : user
              ),
            };
          });
        });
      queryClient.invalidateQueries(usersKeys.users._def);
      queryClient.invalidateQueries(
        usersKeys.user({ login: payload.body.login })
      );
      if (options.onSuccess) {
        options.onSuccess(data, payload, ...args);
      }
    },
  });
};

export const useUserCreate = (
  options: UseMutationOptions<Contract['users']['create'], typeof client> = {}
) => {
  const queryClient = useQueryClient();
  return client.users.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(usersKeys.users._def);
      options?.onSuccess?.(...args);
    },
  });
};

export const useUserRemove = (
  options: UseMutationOptions<Contract['users']['remove'], typeof client> = {}
) => {
  const queryClient = useQueryClient();
  return client.users.remove.useMutation({
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(usersKeys.users._def);
      options?.onSuccess?.(...args);
    },
  });
};
