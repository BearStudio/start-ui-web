import {
  AUTH_HTTP_ALL_DISABLED_FLAGS,
  AUTH_HTTP_ALL_ENABLED_FLAGS,
  CORE_AUTH_HTTP_PATHS,
  SENSITIVE_AUTH_HTTP_PATHS,
} from '@tests/support/auth-http-exposure-fixtures';
import { describe, expect, it } from 'vitest';

import { isBlockedBetterAuthHttpPath } from '@/modules/auth/infrastructure/better-auth/auth-http-exposure';

describe('isBlockedBetterAuthHttpPath', () => {
  it('blocks admin endpoints when disabled', () => {
    for (const pathname of SENSITIVE_AUTH_HTTP_PATHS.filter((path) =>
      path.startsWith('/api/auth/admin')
    )) {
      expect(
        isBlockedBetterAuthHttpPath(pathname, AUTH_HTTP_ALL_DISABLED_FLAGS)
      ).toBe(true);
    }
  });

  it('blocks OpenAPI schema and reference when disabled', () => {
    for (const pathname of SENSITIVE_AUTH_HTTP_PATHS.filter(
      (path) => !path.startsWith('/api/auth/admin')
    )) {
      expect(
        isBlockedBetterAuthHttpPath(pathname, AUTH_HTTP_ALL_DISABLED_FLAGS)
      ).toBe(true);
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

  it('blocks admin endpoints in demo mode even when explicitly enabled', () => {
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/admin/remove-user', {
        adminEndpointsEnabled: true,
        isDemo: true,
        openApiEnabled: true,
      })
    ).toBe(true);
  });

  it('allows OpenAPI endpoints when explicitly enabled', () => {
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/open-api/generate-schema', {
        adminEndpointsEnabled: false,
        isDemo: true,
        openApiEnabled: true,
      })
    ).toBe(false);
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/reference', {
        adminEndpointsEnabled: false,
        isDemo: true,
        openApiEnabled: true,
      })
    ).toBe(false);
  });

  it('never blocks core auth endpoints regardless of flags', () => {
    for (const pathname of CORE_AUTH_HTTP_PATHS) {
      expect(
        isBlockedBetterAuthHttpPath(pathname, AUTH_HTTP_ALL_DISABLED_FLAGS)
      ).toBe(false);
      expect(
        isBlockedBetterAuthHttpPath(pathname, AUTH_HTTP_ALL_ENABLED_FLAGS)
      ).toBe(false);
    }
  });

  it('matches on path boundaries and does not block unrelated siblings', () => {
    expect(
      isBlockedBetterAuthHttpPath(
        '/api/auth/administrate',
        AUTH_HTTP_ALL_DISABLED_FLAGS
      )
    ).toBe(false);
    expect(
      isBlockedBetterAuthHttpPath(
        '/api/auth/open-api-docs',
        AUTH_HTTP_ALL_DISABLED_FLAGS
      )
    ).toBe(false);
    expect(
      isBlockedBetterAuthHttpPath(
        '/api/auth/references',
        AUTH_HTTP_ALL_DISABLED_FLAGS
      )
    ).toBe(false);
  });

  it('normalizes repeated slashes before matching blocked paths', () => {
    expect(
      isBlockedBetterAuthHttpPath(
        '/api/auth//admin/list-users',
        AUTH_HTTP_ALL_DISABLED_FLAGS
      )
    ).toBe(true);
    expect(
      isBlockedBetterAuthHttpPath(
        '//api/auth/open-api/generate-schema',
        AUTH_HTTP_ALL_DISABLED_FLAGS
      )
    ).toBe(true);
  });

  it('honors a custom base path', () => {
    expect(
      isBlockedBetterAuthHttpPath('/auth/admin/set-role', {
        ...AUTH_HTTP_ALL_DISABLED_FLAGS,
        basePath: '/auth',
      })
    ).toBe(true);
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/admin/set-role', {
        ...AUTH_HTTP_ALL_DISABLED_FLAGS,
        basePath: '/auth',
      })
    ).toBe(false);
  });
});
