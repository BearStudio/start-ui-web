import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { User, UserList } from '@/app/admin/users/users.types';
import { DEFAULT_LANGUAGE_KEY } from '@/constants/i18n';

type UserMutateError = {
  title: string;
  errorKey: string;
};

namespace UsersQueryKeys {
  export namespace all {
    export const keys = () => [] as const;
    export type type = ReturnType<typeof keys>;
  }
  export namespace users {
    export const keys = (page: number, size: number) =>
      [...all.keys(), 'users', { page, size }] as const;
    export type type = ReturnType<typeof keys>;
  }

  export namespace user {
    export const keys = (login: string | undefined) =>
      [...all.keys(), 'users', login] as const;
    export type type = ReturnType<typeof keys>;
  }
}

export const useUserList = (
  { page = 0, size = 10 } = {},
  config: UseQueryOptions<
    UserList,
    AxiosError,
    UserList,
    UsersQueryKeys.users.type
  > = {}
) => {
  const result = useQuery(
    UsersQueryKeys.users.keys(page, size),
    (): Promise<UserList> =>
      Axios.get('/admin/users', { params: { page, size, sort: 'id,desc' } }),
    {
      keepPreviousData: true,
      ...config,
    }
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
  config: UseQueryOptions<User, AxiosError, User, UsersQueryKeys.user.type> = {}
) => {
  const result = useQuery(
    UsersQueryKeys.user.keys(userLogin),
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
      queryClient.cancelQueries('users');
      queryClient
        .getQueryCache()
        .findAll('users')
        .forEach(({ queryKey }) => {
          queryClient.setQueryData<UserList>(queryKey, (cachedData: TODO) => {
            if (!cachedData) return;
            return {
              ...cachedData,
              content: (cachedData.content || []).map((user) =>
                user.id === data.id ? data : user
              ),
            };
          });
        });
      queryClient.invalidateQueries('users');
      queryClient.invalidateQueries(['user', payload.login]);
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
  return useMutation(
    ({ langKey = DEFAULT_LANGUAGE_KEY, ...payload }) =>
      Axios.post('/admin/users', {
        langKey,
        ...payload,
      }),
    {
      ...config,
    }
  );
};

type UserWithLoginOnly = Pick<User, 'login'>;

export const useUserRemove = (
  config: UseMutationOptions<void, unknown, UserWithLoginOnly> = {}
) => {
  return useMutation(
    (user: UserWithLoginOnly): Promise<void> =>
      Axios.delete(`/admin/users/${user.login}`),
    { ...config }
  );
};
