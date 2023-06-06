import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import Axios, { AxiosError } from 'axios';

import { User, UserList, zUser, zUserList } from '@/features/users/schema';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

type UserMutateError = ApiErrorResponse & {
  errorKey: 'userexists' | 'emailexists';
};

const USERS_BASE_URL = '/admin/users';

const usersKeys = createQueryKeys('usersService', {
  users: (params: { page?: number; size?: number }) => [params],
  user: (params: { login?: string }) => [params],
  userForm: null,
});

export const useUserList = (
  { page = 0, size = 10 } = {},
  queryOptions: UseQueryOptions<UserList> = {}
) => {
  const query = useQuery({
    queryKey: usersKeys.users({ page, size }).queryKey,
    queryFn: async () => {
      const response = await Axios.get(USERS_BASE_URL, {
        params: { page, size, sort: 'id,desc' },
      });
      return zUserList().parse({
        users: response.data,
        totalItems: response.headers?.['x-total-count'],
      });
    },
    keepPreviousData: true,
    ...queryOptions,
  });

  const users = query.data?.users;
  const totalItems = query.data?.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / size);
  const hasMore = page + 1 < totalPages;
  const isLoadingPage = query.isFetching;

  return {
    users,
    totalItems,
    hasMore,
    totalPages,
    isLoadingPage,
    ...query,
  };
};

export const useUser = (
  userLogin?: string,
  queryOptions: UseQueryOptions<User> = {}
) => {
  return useQuery({
    queryKey: usersKeys.user({ login: userLogin }).queryKey,
    queryFn: async () => {
      const response = await Axios.get(`${USERS_BASE_URL}/${userLogin}`);
      return zUser().parse(response.data);
    },
    enabled: !!userLogin,
    ...queryOptions,
  });
};

export const useUserFormQuery = (
  userLogin?: string,
  queryOptions: UseQueryOptions<User> = {}
) =>
  useUser(userLogin, {
    queryKey: usersKeys.userForm.queryKey,
    staleTime: Infinity,
    cacheTime: 0,
    ...queryOptions,
  });

export const useUserUpdate = (
  config: UseMutationOptions<User, AxiosError<UserMutateError>, User> = {}
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      const response = await Axios.put(USERS_BASE_URL, payload);
      return zUser().parse(response.data);
    },
    {
      ...config,
      onSuccess: (data, payload, ...args) => {
        queryClient.cancelQueries(usersKeys.users._def);
        queryClient
          .getQueryCache()
          .findAll(usersKeys.users._def)
          .forEach(({ queryKey }) => {
            queryClient.setQueryData<UserList | undefined>(
              queryKey,
              (cachedData) => {
                if (!cachedData) return;
                return {
                  ...cachedData,
                  content: (cachedData.users || []).map((user) =>
                    user.id === data.id ? data : user
                  ),
                };
              }
            );
          });
        queryClient.invalidateQueries(usersKeys.users._def);
        queryClient.invalidateQueries(usersKeys.user({ login: payload.login }));
        if (config.onSuccess) {
          config.onSuccess(data, payload, ...args);
        }
      },
    }
  );
};

export const useUserCreate = (
  config: UseMutationOptions<
    User,
    AxiosError<UserMutateError>,
    Pick<
      User,
      'login' | 'email' | 'firstName' | 'lastName' | 'langKey' | 'authorities'
    >
  > = {}
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ langKey = DEFAULT_LANGUAGE_KEY, ...payload }) => {
      const response = await Axios.post('/admin/users', {
        langKey,
        ...payload,
      });
      return zUser().parse(response.data);
    },
    {
      ...config,
      onSuccess: (...args) => {
        queryClient.invalidateQueries(usersKeys.users._def);
        config?.onSuccess?.(...args);
      },
    }
  );
};

export const useUserRemove = (
  config: UseMutationOptions<
    void,
    AxiosError<ApiErrorResponse>,
    Pick<User, 'login'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (user) => {
      await Axios.delete(`/admin/users/${user.login}`);
    },
    {
      ...config,
      onSuccess: (...args) => {
        queryClient.invalidateQueries(usersKeys.users._def);
        config?.onSuccess?.(...args);
      },
    }
  );
};
