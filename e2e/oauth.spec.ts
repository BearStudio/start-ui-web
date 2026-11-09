import { expect, test } from 'e2e/utils';

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
