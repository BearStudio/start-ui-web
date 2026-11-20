import { expect, test } from 'e2e/utils';
import { ADMIN_EMAIL } from 'e2e/utils/constants';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import {
  AUTH_EMAIL_OTP_MOCKED,
  AUTH_SIGNUP_ENABLED,
} from '@/features/auth/config';
import locales from '@/locales';

// Authorization query shaped like the one Better Auth sends to the login page,
// with an invalid signature. Better Auth rejects it with the same
// `invalid_signature` error as an expired query (the signature covers `exp`,
// so a validly signed expired query cannot be forged without the secret).
const INVALID_OAUTH_QUERY =
  'client_id=abc&ba_param=ba_param&ba_param=client_id&ba_param=exp&exp=1&sig=invalid';

const i18n = locales[DEFAULT_LANGUAGE_KEY].auth;

test.describe('OAuth discovery for MCP clients', () => {
  test('Protected resource metadata points to the authorization server', async ({
    request,
  }) => {
    for (const path of [
      '/.well-known/oauth-protected-resource/api/mcp',
      '/.well-known/oauth-protected-resource',
    ]) {
      const response = await request.get(path);
      expect(response).toBeOK();
      expect(response.headers()['access-control-allow-origin']).toBe('*');

      const metadata = await response.json();
      expect(metadata.resource).toMatch(/\/api\/mcp$/);
      expect(metadata.authorization_servers).toHaveLength(1);
      expect(metadata.authorization_servers[0]).toMatch(/\/api\/auth$/);
      expect(metadata.scopes_supported).toEqual(['mcp:read', 'mcp:write']);
    }
  });

  test('Authorization server metadata supports Client ID Metadata Documents', async ({
    request,
  }) => {
    const resource = await (
      await request.get('/.well-known/oauth-protected-resource/api/mcp')
    ).json();

    const response = await request.get(
      '/.well-known/oauth-authorization-server/api/auth'
    );
    expect(response).toBeOK();

    const metadata = await response.json();
    expect(metadata.issuer).toBe(resource.authorization_servers[0]);
    expect(metadata.client_id_metadata_document_supported).toBe(true);
    expect(metadata.code_challenge_methods_supported).toEqual(['S256']);
    expect(metadata.scopes_supported).toEqual(
      expect.arrayContaining(['mcp:read', 'mcp:write'])
    );
  });

  test('Session JWT endpoint is disabled', async ({ request }) => {
    const response = await request.get('/api/auth/token');
    expect(response.status()).toBe(404);
  });
});

test.describe('Invalid OAuth authorization request', () => {
  test('Login page asks to restart from the client', async ({ page }) => {
    await page.to(`/login?${INVALID_OAUTH_QUERY}`);
    await page.getByPlaceholder(i18n.common.email.label).fill(ADMIN_EMAIL);
    await page
      .getByRole('button', {
        name: i18n[AUTH_SIGNUP_ENABLED ? 'pageLoginWithSignUp' : 'pageLogin']
          .loginWithEmail,
      })
      .click();

    await page.waitForURL('**/login/error**');
    await expect(
      page.getByText(i18n.pageOAuthConsent.invalid.title)
    ).toBeVisible();
  });

  test('Verify page asks to restart from the client', async ({ page }) => {
    const search = new URLSearchParams({
      email: ADMIN_EMAIL,
      oauthQuery: INVALID_OAUTH_QUERY,
    });
    await page.to(`/login/verify?${search}`);
    await page.getByText(i18n.common.otp.label).fill(AUTH_EMAIL_OTP_MOCKED);

    await page.waitForURL('**/login/error**');
    await expect(
      page.getByText(i18n.pageOAuthConsent.invalid.title)
    ).toBeVisible();
  });
});
