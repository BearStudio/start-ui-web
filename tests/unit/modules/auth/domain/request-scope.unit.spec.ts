import { describe, expect, it } from 'vitest';

import {
  sanitizeCurrentSession,
  scopeFromUser,
  scopeKeyFromScope,
  scopeKeyFromSession,
} from '@/modules/auth/domain/request-scope';
import { toEmailAddress, toSessionId, toUserId } from '@/modules/kernel';

const authSession = {
  user: {
    id: toUserId('user-1'),
    email: toEmailAddress('user@example.com'),
    name: 'User One',
    image: null,
    emailVerified: true,
    role: 'admin' as const,
    onboardedAt: new Date('2024-01-01T00:00:00.000Z'),
    token: 'must-not-leak',
  },
  session: {
    id: toSessionId('session-1'),
    token: 'session-token',
    expiresAt: new Date('2024-01-02T00:00:00.000Z'),
  },
} as ExplicitAny;

describe('request scope', () => {
  it('builds stable scope keys', () => {
    const scope = scopeFromUser(authSession.user);

    expect(scope.userId).toBe(authSession.user.id);
    expect(scopeKeyFromScope(scope)).toBe('user:user-1:role:admin');
    expect(
      scopeKeyFromScope({
        userId: toUserId('user-1'),
        role: 'admin',
      })
    ).toBe('user:user-1:role:admin');
    expect(scopeKeyFromSession(null)).toBe('anonymous');
    expect(scopeKeyFromSession(authSession)).toBe('user:user-1:role:admin');
  });

  it('sanitizes current session data for browser queries', () => {
    expect(sanitizeCurrentSession(authSession)).toEqual({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User One',
        image: null,
        emailVerified: true,
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
      },
      scopeKey: 'user:user-1:role:admin',
    });
  });
});
