import { queryOptions } from '@tanstack/react-query';

import { configEnv } from '../transport/tanstack/config-server-functions';

export const configQueries = {
  env: () =>
    queryOptions({
      queryKey: ['config', 'env'] as const,
      queryFn: () => configEnv(),
    }),
};
