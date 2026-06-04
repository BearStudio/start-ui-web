import { describe, expect, it, vi } from 'vitest';

import { accountQueries } from '@/modules/account/client';
import {
  type AccountQueryFacade,
  createAccountQueries,
} from '@/modules/account/presentation/queries';

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

  it('calls injected facade functions with server function data payloads', async () => {
    const facade = {
      accountSubmitOnboarding: vi.fn(async () => ({ type: 'submitted' })),
      accountUpdateInfo: vi.fn(async () => ({ type: 'updated' })),
    } as unknown as AccountQueryFacade;
    const queries = createAccountQueries(facade);

    await (
      queries.submitOnboarding().mutationFn as (data: {
        name: string;
      }) => Promise<unknown>
    )({ name: 'Ada' });
    await (
      queries.updateInfo().mutationFn as (data: {
        name: string;
      }) => Promise<unknown>
    )({ name: 'Grace' });

    expect(facade.accountSubmitOnboarding).toHaveBeenCalledWith({
      data: { name: 'Ada' },
    });
    expect(facade.accountUpdateInfo).toHaveBeenCalledWith({
      data: { name: 'Grace' },
    });
  });
});
