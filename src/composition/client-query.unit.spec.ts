import { describe, expect, it } from 'vitest';

import { createClientQueryClient } from './client-query';

describe('client query composition', () => {
  it('creates isolated QueryClient instances for independent routers', () => {
    expect(createClientQueryClient()).not.toBe(createClientQueryClient());
  });
});
