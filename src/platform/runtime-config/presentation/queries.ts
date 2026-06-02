import { queryOptions } from '@tanstack/react-query';

import { observeQueryOperation } from '@/platform/lib/tanstack-query/observability';

import { configEnv } from '../server';

const configEnvQueryKey = ['config', 'env'] as const;

export const configQueries = {
  env: () =>
    queryOptions({
      queryKey: configEnvQueryKey,
      queryFn: () =>
        observeQueryOperation(configEnvQueryKey, 'query', () => configEnv()),
    }),
};
