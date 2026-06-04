import { describe, expect, it, vi } from 'vitest';

import { configQueries } from '@/platform/runtime-config/client';
import {
  type ConfigQueryFacade,
  createConfigQueries,
} from '@/platform/runtime-config/presentation/queries';

describe('runtime config query keys', () => {
  it('uses a versioned env query key', () => {
    expect(configQueries.env().queryKey).toEqual(['config', 'v1', 'env']);
  });

  it('calls the injected facade for env config', async () => {
    const facade = {
      configEnv: vi.fn(async () => ({ environment: 'test' })),
    } as unknown as ConfigQueryFacade;
    const queries = createConfigQueries(facade);

    await (queries.env().queryFn as () => Promise<unknown>)();

    expect(facade.configEnv).toHaveBeenCalledWith();
  });
});
