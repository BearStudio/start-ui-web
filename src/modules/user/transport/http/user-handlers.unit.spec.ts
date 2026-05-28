import { describe, expect, it, vi } from 'vitest';

import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import { createAuthenticatedContext } from '@/tests/server/test-utils';

import {
  createUserHandlers,
  zGetUserSessionsInput,
  zUpdateByIdInput,
} from './user-handlers';

describe('user HTTP transport handlers', () => {
  it('maps update input into typed user values', async () => {
    const ctx = createAuthenticatedContext();
    const update = vi.fn(async () => ({
      ok: true as const,
      value: { id: toUserId('user-2') },
    }));
    const handlers = createUserHandlers({
      getUseCases: () => ({ update }) as ExplicitAny,
    });

    await handlers.updateById(
      ctx,
      zUpdateByIdInput().parse({
        id: 'user-2',
        name: 'Ada',
        email: 'ada@example.com',
        role: 'admin',
      })
    );

    expect(update).toHaveBeenCalledWith({
      scope: ctx.scope,
      id: toUserId('user-2'),
      user: {
        name: 'Ada',
        email: toEmailAddress('ada@example.com'),
        role: 'admin',
      },
    });
  });

  it('maps session pagination input to the list-sessions use case', async () => {
    const ctx = createAuthenticatedContext();
    const listSessions = vi.fn(async () => ({
      ok: true as const,
      value: { items: [], total: 0 },
    }));
    const handlers = createUserHandlers({
      getUseCases: () => ({ listSessions }) as ExplicitAny,
    });

    await handlers.getUserSessions(
      ctx,
      zGetUserSessionsInput().parse({
        userId: 'user-2',
        cursor: 'session-2',
        limit: '5',
      })
    );

    expect(listSessions).toHaveBeenCalledWith({
      scope: ctx.scope,
      userId: toUserId('user-2'),
      cursor: toSessionId('session-2'),
      limit: 5,
    });
  });
});
