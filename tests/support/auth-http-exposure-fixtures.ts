export const AUTH_HTTP_ALL_DISABLED_FLAGS = {
  adminEndpointsEnabled: false,
  openApiEnabled: false,
} as const;

export const AUTH_HTTP_ALL_ENABLED_FLAGS = {
  adminEndpointsEnabled: true,
  openApiEnabled: true,
} as const;

export const SENSITIVE_AUTH_HTTP_PATHS = [
  '/api/auth/admin',
  '/api/auth/admin/list-users',
  '/api/auth/admin/set-role',
  '/api/auth/admin/remove-user',
  '/api/auth/admin/ban-user',
  '/api/auth/admin/impersonate-user',
  '/api/auth/admin/revoke-user-session',
  '/api/auth/admin/revoke-user-sessions',
  '/api/auth/admin/has-permission',
  '/api/auth/open-api/generate-schema',
  '/api/auth/reference',
] as const;

export const CORE_AUTH_HTTP_PATHS = [
  '/api/auth/sign-in/email-otp',
  '/api/auth/email-otp/send-verification-otp',
  '/api/auth/get-session',
  '/api/auth/sign-out',
  '/api/auth/callback/github',
] as const;
