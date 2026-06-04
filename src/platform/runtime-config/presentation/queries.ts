/* oxlint-disable @tanstack/query/exhaustive-deps -- Query factories inject a stable facade; facade identity is not a cache-key dimension. */
import { queryOptions } from '@tanstack/react-query';

import { observeQueryOperation } from '@/platform/lib/tanstack-query/observability';
import type { ServerFunctionFacade } from '@/platform/lib/tanstack-start/server-function-types';

import type { ConfigServerFunctions } from '../server';

export type ConfigQueryFacade = ServerFunctionFacade<
  Pick<ConfigServerFunctions, 'configEnv'>
>;

const configQueryVersion = 'v1';
const configEnvQueryKey = ['config', configQueryVersion, 'env'] as const;

export const createConfigQueries = <TFacade extends ConfigQueryFacade>(
  facade: TFacade
) => ({
  env: () =>
    queryOptions({
      queryKey: configEnvQueryKey,
      queryFn: () =>
        observeQueryOperation(configEnvQueryKey, 'query', () =>
          facade.configEnv()
        ),
    }),
});
