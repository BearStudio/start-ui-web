import { expect, test } from 'e2e/utils';
import { ADMIN_FILE } from 'e2e/utils/constants';

const listToolsRequest = {
  data: { jsonrpc: '2.0', id: 1, method: 'tools/list' },
  headers: { accept: 'application/json, text/event-stream' },
};

test.describe('MCP server', () => {
  test('Asks MCP clients to authenticate with OAuth', async ({ request }) => {
    const response = await request.post('/api/mcp', listToolsRequest);

    expect(response.status()).toBe(401);
    const challenge = response.headers()['www-authenticate'];
    expect(challenge).toContain(
      '/.well-known/oauth-protected-resource/api/mcp'
    );
    expect(challenge).toContain('scope="mcp:read"');
  });

  test('Rejects invalid access tokens', async ({ request }) => {
    const response = await request.post('/api/mcp', {
      ...listToolsRequest,
      headers: {
        ...listToolsRequest.headers,
        authorization: 'Bearer invalid-token',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('Ignores the session cookie', async ({ browser }) => {
    // Signed-in admin (storage state from the setup project), no bearer token
    const context = await browser.newContext({
      storageState: ADMIN_FILE,
    });
    const response = await context.request.post('/api/mcp', listToolsRequest);

    expect(response.status()).toBe(401);
    await context.close();
  });

  test('Rejects untrusted browser origins', async ({ request }) => {
    const response = await request.post('/api/mcp', {
      ...listToolsRequest,
      headers: { ...listToolsRequest.headers, origin: 'https://evil.example' },
    });

    expect(response.status()).toBe(403);
  });
});
