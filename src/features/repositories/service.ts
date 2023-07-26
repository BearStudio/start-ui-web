import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Axios, { AxiosError } from 'axios';

import {
  Repository,
  RepositoryList,
  zRepository,
  zRepositoryList,
} from '@/features/repositories/schema';

type RepositoryMutateError = ApiErrorResponse & {
  errorKey: 'name_already_used';
};

const REPOSITORIES_BASE_URL = '/repositories';

const repositoriesKeys = createQueryKeys('repositoriesService', {
  repositories: (params: { page?: number; size?: number }) => [params],
  repository: (params: { id?: number }) => [params],
  repositoryForm: null,
});

export const useRepositoryList = (
  { page = 0, size = 10 } = {},
  queryOptions: UseQueryOptions<RepositoryList> = {}
) => {
  const query = useQuery({
    queryKey: repositoriesKeys.repositories({ page, size }).queryKey,
    queryFn: async () => {
      const response = await Axios.get(REPOSITORIES_BASE_URL, {
        params: { page, size, sort: 'id,desc' },
      });
      return zRepositoryList().parse({
        repositories: response.data,
        totalItems: response.headers?.['x-total-count'],
      });
    },
    keepPreviousData: true,
    ...queryOptions,
  });

  const repositories = query.data?.repositories;
  const totalItems = query.data?.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / size);
  const hasMore = page + 1 < totalPages;
  const isLoadingPage = query.isFetching;

  return {
    repositories,
    totalItems,
    hasMore,
    totalPages,
    isLoadingPage,
    ...query,
  };
};

export const useRepository = (
  repositoryId?: number,
  queryOptions: UseQueryOptions<Repository> = {}
) => {
  return useQuery({
    queryKey: repositoriesKeys.repository({ id: repositoryId }).queryKey,
    queryFn: async () => {
      const response = await Axios.get(
        `${REPOSITORIES_BASE_URL}/${repositoryId}`
      );
      return zRepository().parse(response.data);
    },

    enabled: !!repositoryId,
    ...queryOptions,
  });
};

export const useRepositoryFormQuery = (
  repositoryId?: number,
  queryOptions: UseQueryOptions<Repository> = {}
) =>
  useRepository(repositoryId, {
    queryKey: repositoriesKeys.repositoryForm.queryKey,
    staleTime: Infinity,
    cacheTime: 0,
    ...queryOptions,
  });

export const useRepositoryUpdate = (
  config: UseMutationOptions<
    Repository,
    AxiosError<RepositoryMutateError>,
    Repository
  > = {}
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      const response = await Axios.put(REPOSITORIES_BASE_URL, payload);
      return zRepository().parse(response.data);
    },
    {
      ...config,
      onSuccess: (data, payload, ...args) => {
        queryClient.cancelQueries(repositoriesKeys.repositories._def);
        queryClient
          .getQueryCache()
          .findAll(repositoriesKeys.repositories._def)
          .forEach(({ queryKey }) => {
            queryClient.setQueryData<RepositoryList | undefined>(
              queryKey,
              (cachedData) => {
                if (!cachedData) return;
                return {
                  ...cachedData,
                  content: (cachedData.repositories || []).map((repository) =>
                    repository.id === data.id ? data : repository
                  ),
                };
              }
            );
          });
        queryClient.invalidateQueries(repositoriesKeys.repositories._def);
        queryClient.invalidateQueries(
          repositoriesKeys.repository({ id: payload.id })
        );

        config?.onSuccess?.(data, payload, ...args);
      },
    }
  );
};

export const useRepositoryCreate = (
  config: UseMutationOptions<
    Repository,
    AxiosError<RepositoryMutateError>,
    Pick<Repository, 'name' | 'link' | 'description'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      const response = await Axios.post('/repositories', payload);
      return zRepository().parse(response.data);
    },
    {
      ...config,
      onSuccess: async (...args) => {
        await queryClient.invalidateQueries(repositoriesKeys.repositories._def);
        await config?.onSuccess?.(...args);
      },
    }
  );
};

export const useRepositoryRemove = (
  config: UseMutationOptions<
    void,
    AxiosError<ApiErrorResponse>,
    Pick<Repository, 'id' | 'name'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (repository) => {
      await Axios.delete(`/repositories/${repository.id}`);
    },
    {
      ...config,
      onSuccess: async (...args) => {
        await queryClient.invalidateQueries(repositoriesKeys.repositories._def);
        await config?.onSuccess?.(...args);
      },
    }
  );
};
