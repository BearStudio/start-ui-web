import Axios from 'axios';
import {
  useMutation,
  MutationOptions,
  useQuery,
  useQueryClient,
} from 'react-query';

export const useUserList = ({ page = 0, size = 10 } = {}) => {
  const result = useQuery<any>(
    ['users', { page, size }],
    (): Promise<any> => Axios.get('/users', { params: { page, size } }),
    {
      keepPreviousData: true,
    }
  );

  const { content: users, totalItems } = result.data || {};
  const totalPages = Math.ceil(totalItems / size);
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

export const useUser = (userLogin: string) => {
  const result = useQuery<any>(
    ['user', userLogin],
    (): Promise<any> => Axios.get(`/users/${userLogin}`),
    {
      keepPreviousData: true,
    }
  );

  return {
    user: result.data,
    ...result,
  };
};

export const useUserUpdate = (config: MutationOptions = {}) => {
  const queryCache = useQueryClient();
  return useMutation<any>((payload: any) => Axios.put('/users', payload), {
    ...config,
    onSuccess: (data: any, ...rest) => {
      queryCache.cancelQueries('users');
      queryCache
        .getQueryCache()
        .findAll('users')
        .forEach(({ queryKey }) => {
          queryCache.setQueryData(queryKey, (cachedData: any) => {
            if (!cachedData) return;
            return {
              ...cachedData,
              content: (cachedData.content || []).map((user) =>
                user.id === data.id ? data : user
              ),
            };
          });
        });
      queryCache.invalidateQueries('users');
      if (config.onSuccess) {
        config.onSuccess(data, ...rest);
      }
    },
  });
};

export const useUserCreate = (config: MutationOptions = {}) => {
  return useMutation<any, any, any>(
    ({
      login,
      firstName,
      LastName,
      email,
      activated,
      langKey = 'en',
      authorities,
    }) =>
      Axios.post('/users', {
        login,
        firstName,
        LastName,
        email,
        activated,
        langKey,
        authorities,
      }),
    {
      ...config,
    }
  );
};
