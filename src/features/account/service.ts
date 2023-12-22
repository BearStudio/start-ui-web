import { UseQueryOptions } from '@tanstack/react-query';

import { useFileFetch } from '@/hooks/useFileFetch';

export const useFetchAvatar = (url: string, config?: UseQueryOptions) => {
  return useFileFetch(url, ['name'], {
    queryKey: ['account', url],
    ...config,
  });
};
