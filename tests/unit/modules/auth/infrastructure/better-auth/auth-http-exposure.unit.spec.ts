import { describe, expect, it } from 'vitest';

import { isBlockedBetterAuthHttpPath } from '@/modules/auth/infrastructure/better-auth/auth-http-exposure';

const ALL_DISABLED = {
  adminEndpointsEnabled: false,
  openApiEnabled: false,
} as const;

const ALL_ENABLED = {
  adminEndpointsEnabled: true,
  openApiEnabled: true,
} as const;

describe('isBlockedBetterAuthHttpPath', () => {
  it('blocks admin endpoints when disabled', () => {
    for (const pathname of [
      '/api/auth/admin',
      '/api/auth/admin/list-users',
      '/api/auth/admin/set-role',
      '/api/auth/admin/remove-user',
      '/api/auth/admin/has-permission',
      '/api/auth/admin/impersonate-user',
      '/api/auth/admin/revoke-user-sessions',
    ]) {
      expect(isBlockedBetterAuthHttpPath(pathname, ALL_DISABLED)).toBe(true);
    }
  });

  it('blocks OpenAPI schema and reference when disabled', () => {
    for (const pathname of [
      '/api/auth/open-api/generate-schema',
      '/api/auth/reference',
    ]) {
      expect(isBlockedBetterAuthHttpPath(pathname, ALL_DISABLED)).toBe(true);
    }
  });

  it('allows admin endpoints when explicitly enabled', () => {
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/admin/set-role', {
        adminEndpointsEnabled: true,
        openApiEnabled: false,
      })
    ).toBe(false);
  });

  it('allows OpenAPI endpoints when explicitly enabled', () => {
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/open-api/generate-schema', {
        adminEndpointsEnabled: false,
        openApiEnabled: true,
      })
    ).toBe(false);
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/reference', {
        adminEndpointsEnabled: false,
        openApiEnabled: true,
      })
    ).toBe(false);
  });

  it('never blocks core auth endpoints regardless of flags', () => {
    for (const pathname of [
      '/api/auth/sign-in/email-otp',
      '/api/auth/email-otp/send-verification-otp',
      '/api/auth/get-session',
      '/api/auth/sign-out',
      '/api/auth/callback/github',
    ]) {
      expect(isBlockedBetterAuthHttpPath(pathname, ALL_DISABLED)).toBe(false);
      expect(isBlockedBetterAuthHttpPath(pathname, ALL_ENABLED)).toBe(false);
    }
  });

  it('matches on path boundaries and does not block unrelated siblings', () => {
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/administrate', ALL_DISABLED)
    ).toBe(false);
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/open-api-docs', ALL_DISABLED)
    ).toBe(false);
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/references', ALL_DISABLED)
    ).toBe(false);
  });

  it('honors a custom base path', () => {
    expect(
      isBlockedBetterAuthHttpPath('/auth/admin/set-role', {
        ...ALL_DISABLED,
        basePath: '/auth',
      })
    ).toBe(true);
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/admin/set-role', {
        ...ALL_DISABLED,
        basePath: '/auth',
      })
    ).toBe(false);
  });
});
