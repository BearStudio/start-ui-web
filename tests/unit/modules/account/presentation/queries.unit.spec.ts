import { describe, expect, it } from 'vitest';

import { accountQueries } from '@/modules/account/presentation/queries';

describe('account mutation keys', () => {
  it('uses versioned mutation keys', () => {
    expect(accountQueries.submitOnboarding().mutationKey).toEqual([
      'account',
      'v1',
      'submitOnboarding',
    ]);
    expect(accountQueries.updateInfo().mutationKey).toEqual([
      'account',
      'v1',
      'updateInfo',
    ]);
  });
});
