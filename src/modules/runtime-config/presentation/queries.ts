import { queryOptions } from '@tanstack/react-query';

import { configEnv } from '../server';

export const configQueries = {
  env: () =>
    queryOptions({
      queryKey: ['config', 'env'] as const,
      queryFn: () => configEnv(),
    }),
};
