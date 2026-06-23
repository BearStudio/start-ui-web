import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { isBlockedBetterAuthHttpPath } from '@/modules/auth/infrastructure/better-auth/auth-http-exposure';

const root = process.cwd();

/**
 * Production default: both flags ship `false` (see `config/auth.ts`
 * `z.stringbool().default(false)`), so the Better Auth `admin` HTTP endpoints
 * and the OpenAPI schema/reference are NOT exposed unless explicitly enabled.
 */
const PRODUCTION_DEFAULT_FLAGS = {
  adminEndpointsEnabled: false,
  openApiEnabled: false,
} as const;

const SENSITIVE_AUTH_HTTP_PATHS = [
  '/api/auth/admin/list-users',
  '/api/auth/admin/set-role',
  '/api/auth/admin/remove-user',
  '/api/auth/admin/ban-user',
  '/api/auth/admin/impersonate-user',
  '/api/auth/admin/revoke-user-session',
  '/api/auth/admin/revoke-user-sessions',
  '/api/auth/admin/has-permission',
  '/api/auth/open-api/generate-schema',
  '/api/auth/reference',
] as const;

const CORE_AUTH_HTTP_PATHS = [
  '/api/auth/sign-in/email-otp',
  '/api/auth/email-otp/send-verification-otp',
  '/api/auth/get-session',
  '/api/auth/sign-out',
  '/api/auth/callback/github',
] as const;

describe('Better Auth HTTP exposure (default-off posture)', () => {
  it('blocks admin and OpenAPI endpoints under the shipped default config', () => {
    for (const pathname of SENSITIVE_AUTH_HTTP_PATHS) {
      expect(
        isBlockedBetterAuthHttpPath(pathname, PRODUCTION_DEFAULT_FLAGS)
      ).toBe(true);
    }
  });

  it('keeps core authentication endpoints reachable under the default config', () => {
    for (const pathname of CORE_AUTH_HTTP_PATHS) {
      expect(
        isBlockedBetterAuthHttpPath(pathname, PRODUCTION_DEFAULT_FLAGS)
      ).toBe(false);
    }
  });

  it('ships both exposure flags disabled by default in config/auth.ts', () => {
    const source = fs.readFileSync(
      path.join(root, 'src/modules/kernel/infrastructure/config/auth.ts'),
      'utf8'
    );

    expect(source).toMatch(
      /AUTH_ADMIN_ENDPOINTS_ENABLED:\s*z\.stringbool\(\)\.default\(false\)/
    );
    expect(source).toMatch(
      /AUTH_OPENAPI_ENABLED:\s*z\.stringbool\(\)\.default\(false\)/
    );
  });
});
