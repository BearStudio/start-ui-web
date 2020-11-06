import { usePaginatedQuery, useQuery } from 'react-query';
import Axios from 'axios';

export const useUserList = ({ page = 0, size = 3 } = {}) => {
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
