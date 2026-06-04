import { Result } from '@swan-io/boxed';
import { createAuthenticatedContext } from '@tests/server/test-utils';
import { fc, PROPERTY_DEFAULTS, test } from '@tests/support/property-testing';
import { describe, expect, it, vi } from 'vitest';

import {
  toEmailAddress,
  toSessionId,
  toUserId,
} from '@/modules/kernel/domain/ids';
import {
  createUserHandlers,
  zGetAllInput,
  zGetUserSessionsInput,
  zUpdateByIdInput,
} from '@/modules/user/transport/http/user-handlers';

const validPaginationLimit = fc.integer({ max: 100, min: 1 });
const invalidPaginationLimit = fc.oneof(
  fc.integer({ max: 0, min: -1_000 }),
  fc.integer({ max: 1_000, min: 101 }),
  fc.integer({ max: 99, min: 1 }).map((value) => value + 0.5),
  fc.constantFrom('NaN', 'abc', '1.5')
);
const searchTerm = fc.string({ maxLength: 80 });

describe('user HTTP transport handlers', () => {
  it('maps update input into typed user values', async () => {
    const ctx = createAuthenticatedContext();
    const update = vi.fn(async () =>
      Result.Ok({
        type: 'user_updated' as const,
        user: { id: toUserId('user-2') },
      })
    );
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
      currentUserId: ctx.scope.userId,
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
    const listSessions = vi.fn(async () =>
      Result.Ok({
        type: 'user_sessions_listed' as const,
        page: { items: [], total: 0 },
      })
    );
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
      currentUserId: ctx.scope.userId,
      userId: toUserId('user-2'),
      cursor: toSessionId('session-2'),
      limit: 5,
    });
  });

  test.prop([validPaginationLimit, fc.boolean()], PROPERTY_DEFAULTS)(
    'parses generated valid list pagination limits',
    (limit, asString) => {
      expect(
        zGetAllInput().parse({ limit: asString ? String(limit) : limit }).limit
      ).toBe(limit);
    }
  );

  test.prop([validPaginationLimit, fc.boolean()], PROPERTY_DEFAULTS)(
    'parses generated valid session pagination limits',
    (limit, asString) => {
      expect(
        zGetUserSessionsInput().parse({
          limit: asString ? String(limit) : limit,
          userId: 'user-1',
        }).limit
      ).toBe(limit);
    }
  );

  it('defaults missing pagination limits', () => {
    expect(zGetAllInput().parse({}).limit).toBe(20);
    expect(zGetUserSessionsInput().parse({ userId: 'user-1' }).limit).toBe(20);
  });

  test.prop([invalidPaginationLimit], PROPERTY_DEFAULTS)(
    'rejects generated invalid pagination limits',
    (limit) => {
      expect(() => zGetAllInput().parse({ limit })).toThrow();
      expect(() =>
        zGetUserSessionsInput().parse({ limit, userId: 'user-1' })
      ).toThrow();
    }
  );

  test.prop([searchTerm], PROPERTY_DEFAULTS)(
    'trims generated list search terms',
    (term) => {
      expect(
        zGetAllInput().parse({ searchTerm: ` \t${term}\n ` })
      ).toMatchObject({
        searchTerm: term.trim(),
      });
    }
  );
});
