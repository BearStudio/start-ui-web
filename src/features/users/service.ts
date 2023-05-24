import {
  createQueryKeys,
  inferQueryKeys,
} from '@lukemorales/query-key-factory';
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
});
type UsersKeys = inferQueryKeys<typeof usersKeys>;

export const useUserList = (
  { page = 0, size = 10 } = {},
  config: UseQueryOptions<
    UserList,
    AxiosError<ApiErrorResponse>,
    UserList,
    UsersKeys['users']['queryKey']
  > = {}
) => {
  const result = useQuery(
    usersKeys.users({ page, size }).queryKey,
    async () => {
      const response = await Axios.get(USERS_BASE_URL, {
        params: { page, size, sort: 'id,desc' },
      });
      return zUserList().parse(response);
    },
    { keepPreviousData: true, ...config }
  );

  const { content: users, totalItems } = result.data || {};
  const totalPages = Math.ceil((totalItems ?? 0) / size);
  const hasMore = page + 1 < totalPages;
  const isLoadingPage = result.isFetching;

  return {
    users,
    totalItems,
    hasMore,
    totalPages,
    isLoadingPage,
    ...result,
  };
};

export const useUser = (
  userLogin?: string,
  config: UseQueryOptions<
    User,
    AxiosError<ApiErrorResponse>,
    User,
    UsersKeys['user']['queryKey']
  > = {}
) => {
  const result = useQuery(
    usersKeys.user({ login: userLogin }).queryKey,
    async () => {
      const response = await Axios.get(`${USERS_BASE_URL}/${userLogin}`);
      return zUser().parse(response);
    },
    {
      enabled: !!userLogin,
      ...config,
    }
  );

  return {
    user: result.data,
    ...result,
  };
};

export const useUserUpdate = (
  config: UseMutationOptions<User, AxiosError<UserMutateError>, User> = {}
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (payload) => {
      const response = await Axios.put(USERS_BASE_URL, payload);
      return zUser().parse(response);
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
                  content: (cachedData.content || []).map((user) =>
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
      return zUser().parse(response);
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
