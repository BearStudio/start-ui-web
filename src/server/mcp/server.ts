import {
  type AuthInfo,
  createMcpHandler,
  McpServer,
} from '@modelcontextprotocol/server';
import { getMcpToolMeta, McpRegistrar } from '@orpc/mcp';
import { ZodToJsonSchemaConverter } from '@orpc/zod';

import buildInfo from '@/features/build-info/build-info.gen.json';
import { logger } from '@/server/logger';
import { type McpPrincipal } from '@/server/mcp/config';
import { router } from '@/server/router';

/**
 * Procedures opt in to be exposed as MCP tools with `.meta(mcp.tool({...}))`.
 * Tool name: router path joined with `_` (e.g. `book_getAll`).
 * Title and description: OpenAPI `summary` and `description`.
 */
const registrar = new McpRegistrar(router, {
  converters: [new ZodToJsonSchemaConverter()],
  filter: (contract) => !!getMcpToolMeta(contract),
});

const toMcpPrincipal = (authInfo: AuthInfo | undefined): McpPrincipal => {
  const userId = authInfo?.extra?.userId;
  // The route verifies the access token, a missing user is a misconfiguration
  // (e.g. a client_credentials token, without a user)
  if (!authInfo || typeof userId !== 'string') {
    throw new Error('MCP tool called without an authenticated user');
  }
  return { userId, clientId: authInfo.clientId, scopes: authInfo.scopes };
};

export const createMcpServer = async () => {
  const server = new McpServer({
    name: 'start-ui',
    title: 'Start UI',
    version: buildInfo.display,
  });
  await registrar.register(server, {
    // Initial oRPC context of each tool call: the OAuth access token
    // replaces the session cookie (see src/server/orpc.ts)
    context: (ctx) => ({ mcp: toMcpPrincipal(ctx.http?.authInfo) }),
  });
  return server;
};

export const mcpHandler = createMcpHandler(createMcpServer, {
  // Serve 2025-era clients (stateless) along with 2026-07-28 clients
  legacy: 'stateless',
  onerror: (error) => logger.error({ scope: 'mcp', error }, error.message),
});
