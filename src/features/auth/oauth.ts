/**
 * Better Auth OAuth provider (used by MCP clients) redirects to the login and
 * consent pages with a signed authorization query (`sig` param).
 * The query must be kept untouched to continue the authorization flow.
 */
export const getSignedOAuthQuery = (search: string) => {
  const params = new URLSearchParams(search);
  return params.has('sig') ? params.toString() : undefined;
};

/**
 * The signed query expires `codeExpiresIn` after the redirect (10 minutes by
 * default). Better Auth then rejects every request carrying it with this error
 * (no `code` nor `message`), as it does for a tampered query: the flow must be
 * restarted from the client.
 */
export const isInvalidOAuthQueryError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'error' in error &&
  error.error === 'invalid_signature';

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
