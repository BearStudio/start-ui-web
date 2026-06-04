import {
  createAuthenticatedContext,
  mockSession,
  mockUser,
} from '@tests/server/test-utils';
import { describe, expect, it } from 'vitest';

import { createAuthHandlers } from '@/modules/auth/transport/tanstack/auth-handlers';

describe('auth transport handlers', () => {
  it('maps public context to the sanitized current session contract', () => {
    const handlers = createAuthHandlers();

    expect(handlers.currentSession(createAuthenticatedContext())).toMatchObject(
      {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        session: {
          id: mockSession.id,
          expiresAt: mockSession.expiresAt,
        },
        scope: {
          userId: mockUser.id,
          role: mockUser.role,
        },
        scopeKey: `user:${mockUser.id}:role:${mockUser.role}`,
      }
    );
    expect(
      JSON.stringify(handlers.currentSession(createAuthenticatedContext()))
    ).not.toContain(mockSession.token);
  });

  it('returns null when no authenticated session is bound', () => {
    const handlers = createAuthHandlers();

    expect(
      handlers.currentSession({
        user: null,
        session: null,
        scope: null,
        logger: {
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      })
    ).toBeNull();
  });
});
