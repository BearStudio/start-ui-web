import { Result } from '@swan-io/boxed';
import { describe, expect, it, vi } from 'vitest';

import { createAuthenticatedContext } from '@tests/server/test-utils';

import {
  createAccountHandlers,
  zUpdateInfoInput,
} from '@/modules/account/transport/http/account-handlers';

describe('account HTTP transport handlers', () => {
  it('maps account update input and protected scope to the use case', async () => {
    const ctx = createAuthenticatedContext();
    const updateInfo = vi.fn(async () =>
      Result.Ok({
        type: 'account_updated' as const,
        account: { id: ctx.scope.userId },
      })
    );
    const handlers = createAccountHandlers({
      getUseCases: () => ({ updateInfo }) as ExplicitAny,
    });

    await handlers.updateInfo(
      ctx,
      zUpdateInfoInput().parse({ name: ' Acme ' })
    );

    expect(updateInfo).toHaveBeenCalledWith({
      scope: ctx.scope,
      name: 'Acme',
    });
  });
});
