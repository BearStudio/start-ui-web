import { envClient } from '@/env/client';

/**
 * Canonical URL of the MCP server (RFC 8707 resource indicator).
 * Access tokens issued for MCP clients are audience-bound to it.
 */
export const MCP_RESOURCE = new URL('/api/mcp', envClient.VITE_BASE_URL)
  .toString()
  .replace(/\/$/, '');

export const MCP_SCOPES = {
  read: 'mcp:read',
  write: 'mcp:write',
} as const;

export const MCP_SCOPES_LIST = Object.values(MCP_SCOPES);
