import {
  AUTH_HTTP_ALL_DISABLED_FLAGS,
  CORE_AUTH_HTTP_PATHS,
  SENSITIVE_AUTH_HTTP_PATHS,
} from '@tests/support/auth-http-exposure-fixtures';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { isBlockedBetterAuthHttpPath } from '@/modules/auth/testing';

const root = process.cwd();

/**
 * Production default: both flags ship `false` (see `config/auth.ts`
 * `z.stringbool().default(false)`), so the Better Auth `admin` HTTP endpoints
 * and the OpenAPI schema/reference are NOT exposed unless explicitly enabled.
 */
describe('Better Auth HTTP exposure (default-off posture)', () => {
  it('blocks admin and OpenAPI endpoints under the shipped default config', () => {
    for (const pathname of SENSITIVE_AUTH_HTTP_PATHS) {
      expect(
        isBlockedBetterAuthHttpPath(pathname, AUTH_HTTP_ALL_DISABLED_FLAGS)
      ).toBe(true);
    }
  });

  it('keeps core authentication endpoints reachable under the default config', () => {
    for (const pathname of CORE_AUTH_HTTP_PATHS) {
      expect(
        isBlockedBetterAuthHttpPath(pathname, AUTH_HTTP_ALL_DISABLED_FLAGS)
      ).toBe(false);
    }
  });

  it('forces Better Auth admin HTTP endpoints closed in demo mode', () => {
    expect(
      isBlockedBetterAuthHttpPath('/api/auth/admin/remove-user', {
        adminEndpointsEnabled: true,
        isDemo: true,
        openApiEnabled: true,
      })
    ).toBe(true);
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
