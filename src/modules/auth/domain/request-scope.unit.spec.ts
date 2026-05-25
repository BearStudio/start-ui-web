import { describe, expect, it } from 'vitest';

import {
  sanitizeCurrentSession,
  scopeKeyFromScope,
  scopeKeyFromSession,
} from './request-scope';

const authSession = {
  user: {
    id: 'user-1',
    email: 'user@example.com',
    name: 'User One',
    image: null,
    role: 'admin' as const,
    onboardedAt: new Date('2024-01-01T00:00:00.000Z'),
    token: 'must-not-leak',
  },
  session: {
    id: 'session-1',
    token: 'session-token',
    expiresAt: new Date('2024-01-02T00:00:00.000Z'),
  },
} as ExplicitAny;

describe('request scope', () => {
  it('builds stable scope keys with tenant placeholder support', () => {
    expect(
      scopeKeyFromScope({ userId: 'user-1', role: 'admin', tenantId: null })
    ).toBe('user:user-1:role:admin:tenant:none');
    expect(scopeKeyFromSession(null)).toBe('anonymous');
    expect(scopeKeyFromSession(authSession)).toBe(
      'user:user-1:role:admin:tenant:none'
    );
  });

  it('sanitizes current session data for browser queries', () => {
    expect(sanitizeCurrentSession(authSession)).toEqual({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User One',
        image: null,
        role: 'admin',
        onboardedAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      session: {
        id: 'session-1',
        expiresAt: new Date('2024-01-02T00:00:00.000Z'),
      },
      scope: {
        userId: 'user-1',
        role: 'admin',
        tenantId: null,
      },
      scopeKey: 'user:user-1:role:admin:tenant:none',
    });
  });
});
