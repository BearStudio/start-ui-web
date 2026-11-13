/**
 * Better Auth OAuth provider (used by MCP clients) redirects to the login and
 * consent pages with a signed authorization query (`sig` param).
 * The query must be kept untouched to continue the authorization flow.
 */
export const getSignedOAuthQuery = (search: string) => {
  const params = new URLSearchParams(search);
  return params.has('sig') ? params.toString() : undefined;
};

/** Is the user in the middle of an OAuth authorization flow? */
export const isOAuthFlowSearch = (search: Record<string, unknown>) =>
  'sig' in search || !!search.oauthQuery;

/**
 * Scopes requested by MCP clients, mapped to their translation key
 * (`auth:pageOAuthConsent.scopes.*`).
 */
export const OAUTH_SCOPES_I18N_KEYS = {
  openid: 'openid',
  profile: 'profile',
  email: 'email',
  offline_access: 'offlineAccess',
  'mcp:read': 'mcpRead',
  'mcp:write': 'mcpWrite',
} as const;
