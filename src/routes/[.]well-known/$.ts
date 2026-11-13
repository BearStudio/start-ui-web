import { createFileRoute } from '@tanstack/react-router';

import { auth } from '@/server/auth';

/**
 * OAuth discovery documents for MCP clients, served by Better Auth:
 * - /.well-known/oauth-protected-resource[/api/mcp] (RFC 9728)
 * - /.well-known/oauth-authorization-server/api/auth (RFC 8414)
 * - /.well-known/openid-configuration/api/auth
 * Public metadata, readable from any origin (without credentials).
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

async function handle({ request }: { request: Request }) {
  const response = await auth.handler(request);
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) =>
    headers.set(key, value)
  );
  return new Response(response.body, { status: response.status, headers });
}

export const Route = createFileRoute('/.well-known/$')({
  server: {
    handlers: {
      GET: handle,
      HEAD: handle,
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders }),
    },
  },
});
