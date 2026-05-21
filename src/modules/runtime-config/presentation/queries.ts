import { queryOptions } from '@tanstack/react-query';

import {
  configDevtools,
  configEnv,
} from '../transport/tanstack/config-server-functions';

export const configQueries = {
  env: () =>
    queryOptions({
      queryKey: ['config', 'env'] as const,
      queryFn: () => configEnv(),
    }),
  devtools: () =>
    queryOptions({
      queryKey: ['config', 'devtools'] as const,
      queryFn: () => configDevtools(),
    }),
};
