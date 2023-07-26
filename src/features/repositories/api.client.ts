import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQueryClient } from '@tanstack/react-query';
import {
  UseMutationOptions,
  UseQueryOptions,
  useTsRestQueryClient,
} from '@ts-rest/react-query';
import { z } from 'zod';

import { client } from '@/api/client';
import { Contract } from '@/api/contract';

const repositoriesKeys = createQueryKeys('repositoriesService', {
  repositories: (params: { page?: number; size?: number }) => [params],
  repository: (params: { id?: number }) => [params],
  repositoryForm: null,
});

export const useRepositoryList = (
  { page = 0, size = 10 } = {},
  options: UseQueryOptions<Contract['repositories']['getAll']> = {}
) => {
  const params = { page, size };
  const query = client.repositories.getAll.useQuery(
    repositoriesKeys.repositories(params).queryKey,
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

export const useRepository = (
  id?: number,
  options: UseQueryOptions<Contract['repositories']['getById']> = {}
) => {
  return client.repositories.getById.useQuery(
    options.queryKey ?? repositoriesKeys.repository({ id }).queryKey,
    { params: { id: id?.toString() ?? '' } },
    {
      enabled: !!id,
      ...options,
    }
  );
};

export const useRepositoryFormQuery = (
  id?: number,
  options: UseQueryOptions<Contract['repositories']['getById']> = {}
) =>
  useRepository(id, {
    queryKey: repositoriesKeys.repositoryForm.queryKey,
    staleTime: Infinity,
    cacheTime: 0,
    ...options,
  });

export const useRepositoryUpdate = (
  options: UseMutationOptions<
    Contract['repositories']['update'],
    typeof client
  > = {}
) => {
  const queryClient = useQueryClient();
  const apiQueryClient = useTsRestQueryClient(client);
  return client.repositories.update.useMutation({
    ...options,
    onSuccess: (data, payload, ...args) => {
      queryClient.cancelQueries(repositoriesKeys.repositories._def);
      queryClient
        .getQueryCache()
        .findAll(repositoriesKeys.repositories._def)
        .forEach(({ queryKey }) => {
          apiQueryClient.repositories.getAll.setQueryData(
            queryKey,
            (cachedData) => {
              if (!cachedData) return;
              return {
                ...cachedData,
                content: (cachedData.body || []).map((repository) =>
                  repository.id === data.body.id ? data : repository
                ),
              };
            }
          );
        });
      queryClient.invalidateQueries(repositoriesKeys.repositories._def);
      queryClient.invalidateQueries(
        repositoriesKeys.repository({ id: payload.body.id })
      );
      if (options.onSuccess) {
        options.onSuccess(data, payload, ...args);
      }
    },
  });
};

export const useRepositoryCreate = (
  options: UseMutationOptions<
    Contract['repositories']['create'],
    typeof client
  > = {}
) => {
  const queryClient = useQueryClient();
  return client.repositories.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(repositoriesKeys.repositories._def);
      options?.onSuccess?.(...args);
    },
  });
};

export const useRepositoryRemove = (
  options: UseMutationOptions<
    Contract['repositories']['remove'],
    typeof client
  > = {}
) => {
  const queryClient = useQueryClient();
  return client.repositories.remove.useMutation({
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(repositoriesKeys.repositories._def);
      options?.onSuccess?.(...args);
    },
  });
};
