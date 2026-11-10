import { createMcpProtectedRequestHandler } from '@better-auth/mcp';
import {
  type AuthInfo,
  localhostAllowedOrigins,
  originValidationResponse,
} from '@modelcontextprotocol/server';
import { createFileRoute } from '@tanstack/react-router';

import { envClient } from '@/env/client';
import { envServer } from '@/env/server';
import { corsAllowedOrigins } from '@/server/cors';
import { MCP_SCOPES } from '@/server/mcp/config';
import { MCP_RESOURCE } from '@/server/mcp/resource';
import { mcpHandler } from '@/server/mcp/server';

const authBaseUrl = new URL('/api/auth', envClient.VITE_BASE_URL)
  .toString()
  .replace(/\/$/, '');

// Browser-based MCP clients must come from an origin allowed by CORS (DNS
// rebinding protection), requests without Origin header (server-side clients)
// pass
const originRejectionResponse = async (request: Request) => {
  const origin = request.headers.get('origin');
  if (origin && (await corsAllowedOrigins(origin))) return undefined;
  return originValidationResponse(
    request,
    import.meta.env.DEV ? localhostAllowedOrigins() : []
  );
};

/**
 * Verifies the OAuth access token (issued by Better Auth, see
 * src/server/auth.tsx) and answers unauthenticated requests with the
 * `WWW-Authenticate` header MCP clients use to start the OAuth flow.
 */
const handleAuthenticatedRequest = createMcpProtectedRequestHandler(
  {
    issuer: authBaseUrl,
    audience: MCP_RESOURCE,
    jwksUrl: `${authBaseUrl}/jwks`,
    jwtVerifyOptions: { typ: 'at+jwt', requiredClaims: ['azp'] },
    requiredScopes: [MCP_SCOPES.read],
  },
  (request, claims) => {
    const authInfo: AuthInfo = {
      token: request.headers.get('authorization')?.replace(/^\S+\s+/, '') ?? '',
      clientId: String(claims.azp ?? claims.client_id ?? ''),
      scopes: typeof claims.scope === 'string' ? claims.scope.split(' ') : [],
      expiresAt: claims.exp,
      resource: new URL(MCP_RESOURCE),
      extra: { userId: claims.sub },
    };
    return mcpHandler.fetch(request, { authInfo });
  }
);

async function handle({ request }: { request: Request }) {
  if (!envServer.MCP_ENABLED) {
    return new Response('Not Found', { status: 404 });
  }
  return (
    (await originRejectionResponse(request)) ??
    (await handleAuthenticatedRequest(request))
  );
}

export const Route = createFileRoute('/api/mcp')({
  server: {
    handlers: {
      POST: handle,
      // 2025-era clients may open a SSE stream (GET) or end a session (DELETE),
      // the stateless handler answers 405
      GET: handle,
      DELETE: handle,
    },
  },
});
