import { describe, expect, it } from 'vitest';

import { configQueries } from '@/platform/runtime-config/presentation/queries';

describe('runtime config query keys', () => {
  it('uses a versioned env query key', () => {
    expect(configQueries.env().queryKey).toEqual(['config', 'v1', 'env']);
  });
});
