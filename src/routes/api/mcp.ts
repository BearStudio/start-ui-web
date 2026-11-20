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

const CORS_ALLOWED_METHODS = ['GET', 'POST', 'DELETE'];
const CORS_REQUIRED_HEADERS = ['authorization', 'content-type'];

/**
 * Returns the request origin when CORS allows it (same rules as the oRPC
 * routes, see src/server/cors.ts, plus any localhost port in dev for local
 * MCP clients such as the MCP Inspector), `null` otherwise.
 */
const getCorsOrigin = async (request: Request) => {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  if (
    import.meta.env.DEV &&
    !originValidationResponse(request, localhostAllowedOrigins())
  ) {
    return origin;
  }
  return corsAllowedOrigins(origin);
};

/**
 * Adds CORS headers to a response (including 401 challenges) so browser
 * clients can read it, and exposes `WWW-Authenticate` so they can start the
 * OAuth flow.
 */
const withCorsHeaders = (response: Response, corsOrigin: string | null) => {
  const headers = new Headers(response.headers);
  headers.append('vary', 'Origin');
  if (corsOrigin) {
    headers.set('access-control-allow-origin', corsOrigin);
    headers.set('access-control-expose-headers', 'WWW-Authenticate');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

// Browser-based MCP clients must come from an origin allowed by CORS (DNS
// rebinding protection), requests without Origin header (server-side clients)
// pass
const originRejectionResponse = (
  request: Request,
  corsOrigin: string | null
) => {
  if (corsOrigin) return undefined;
  return originValidationResponse(request, []);
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
  const corsOrigin = await getCorsOrigin(request);
  const response =
    originRejectionResponse(request, corsOrigin) ??
    (await handleAuthenticatedRequest(request));
  return withCorsHeaders(response, corsOrigin);
}

async function handlePreflight({ request }: { request: Request }) {
  if (!envServer.MCP_ENABLED) {
    return new Response('Not Found', { status: 404 });
  }
  const corsOrigin = await getCorsOrigin(request);
  if (!corsOrigin) {
    return new Response(null, { status: 403, headers: { vary: 'Origin' } });
  }
  const requestedHeaders = (
    request.headers.get('access-control-request-headers') ?? ''
  )
    .split(',')
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean);
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': corsOrigin,
      'access-control-allow-methods': CORS_ALLOWED_METHODS.join(', '),
      'access-control-allow-headers': [
        ...new Set([...CORS_REQUIRED_HEADERS, ...requestedHeaders]),
      ].join(', '),
      vary: 'Origin, Access-Control-Request-Headers',
    },
  });
}

export const Route = createFileRoute('/api/mcp')({
  server: {
    handlers: {
      POST: handle,
      // 2025-era clients may open a SSE stream (GET) or end a session (DELETE),
      // the stateless handler answers 405
      GET: handle,
      DELETE: handle,
      // CORS preflight
      OPTIONS: handlePreflight,
    },
  },
});
