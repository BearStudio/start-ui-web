export const MCP_SCOPES = {
  read: 'mcp:read',
  write: 'mcp:write',
} as const;

export const MCP_SCOPES_LIST = Object.values(MCP_SCOPES);

/**
 * Caller of an MCP tool, resolved from the verified OAuth access token.
 * Passed as the initial oRPC context instead of the session cookie.
 */
export type McpPrincipal = {
  userId: string;
  clientId: string;
  scopes: string[];
};
