import { describe, expect, it } from 'vitest';

import { createClientQueryClient } from '@/composition/client-query';

describe('client query composition', () => {
  it('creates isolated QueryClient instances for independent routers', () => {
    expect(createClientQueryClient()).not.toBe(createClientQueryClient());
  });
});
