import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { User, UserList } from '@/app/admin/users/users.types';
import { DEFAULT_LANGUAGE_KEY } from '@/constants/i18n';

type UserMutateError = {
  title: string;
  errorKey: 'userexists' | 'emailexists';
};

const usersKeys = {
  all: () => ['usersService'] as const,
  users: ({ page, size }: { page?: number; size?: number }) =>
    [...usersKeys.all(), 'users', { page, size }] as const,
  user: ({ login }: { login?: string }) =>
    [...usersKeys.all(), 'user', { login }] as const,
};

export const useUserList = (
  { page = 0, size = 10 } = {},
  config: UseQueryOptions<
    UserList,
    AxiosError,
    UserList,
    InferQueryKey<typeof usersKeys.users>
  > = {}
) => {
  const result = useQuery(
    usersKeys.users({ page, size }),
    (): Promise<UserList> =>
      Axios.get('/admin/users', { params: { page, size, sort: 'id,desc' } }),
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
    AxiosError,
    User,
    InferQueryKey<typeof usersKeys.user>
  > = {}
) => {
  const result = useQuery(
    usersKeys.user({ login: userLogin }),
    (): Promise<User> => Axios.get(`/admin/users/${userLogin}`),
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
  return useMutation((payload) => Axios.put('/admin/users', payload), {
    ...config,
    onSuccess: (data, payload, ...rest) => {
      queryClient.cancelQueries([...usersKeys.all(), 'users']);
      queryClient
        .getQueryCache()
        .findAll([...usersKeys.all(), 'users'])
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
      queryClient.invalidateQueries([...usersKeys.all(), 'users']);
      queryClient.invalidateQueries(usersKeys.user({ login: payload.login }));
      if (config.onSuccess) {
        config.onSuccess(data, payload, ...rest);
      }
    },
  });
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
    ({ langKey = DEFAULT_LANGUAGE_KEY, ...payload }) =>
      Axios.post('/admin/users', {
        langKey,
        ...payload,
      }),
    {
      ...config,
      onSuccess: (...args) => {
        queryClient.invalidateQueries([...usersKeys.all(), 'users']);
        config?.onSuccess?.(...args);
      },
    }
  );
};

type UserWithLoginOnly = Pick<User, 'login'>;

export const useUserRemove = (
  config: UseMutationOptions<void, unknown, UserWithLoginOnly> = {}
) => {
  const queryClient = useQueryClient();
  return useMutation(
    (user: UserWithLoginOnly): Promise<void> =>
      Axios.delete(`/admin/users/${user.login}`),
    {
      ...config,
      onSuccess: (...args) => {
        queryClient.invalidateQueries([...usersKeys.all(), 'users']);
        config?.onSuccess?.(...args);
      },
    }
  );
};
