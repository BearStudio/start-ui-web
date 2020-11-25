import Axios from 'axios';
import {
  useMutation,
  MutationConfig,
  usePaginatedQuery,
  useQueryCache,
} from 'react-query';

export const useUserList = ({ page = 0, size = 10 } = {}) => {
  const result = usePaginatedQuery(
    ['users', { page, size }],
    (): Promise<any> => Axios.get('/users', { params: { page, size } })
  );

  const { content: users, totalItems } = result.resolvedData || {};
  const totalPages = Math.ceil(totalItems / size);
  const hasMore = page + 1 < totalPages;

  return {
    users,
    totalItems,
    hasMore,
    totalPages,
    ...result,
  };
};

export const useUserUpdate = (config: MutationConfig<any> = {}) => {
  const queryCache = useQueryCache();
  return useMutation((payload: any) => Axios.put('/users', payload), {
    ...config,
    onSuccess: (data, ...rest) => {
      queryCache.refetchQueries('users');
      if (config.onSuccess) {
        config.onSuccess(data, ...rest);
      }
    },
  });
};
