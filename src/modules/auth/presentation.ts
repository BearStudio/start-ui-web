export { LayoutLogin } from './presentation/layout-login';
export { default as PageLogin } from './presentation/page-login';
export { default as PageLoginError } from './presentation/page-login-error';
export { default as PageLoginVerify } from './presentation/page-login-verify';
export { PageLogout } from './presentation/page-logout';
export { PageOnboarding } from './presentation/page-onboarding';
export type { PostAuthDestination } from './presentation/redirects';
export {
  internalRedirectFromLocation,
  isPostAuthDestinationUrl,
  normalizeInternalRedirect,
  parseSafeRedirectPath,
  resolvePostAuthDestination,
} from './presentation/redirects';
export {
  ForbiddenRouteError,
  isForbiddenRouteContext,
  isForbiddenRouteError,
  redirectAuthenticatedRoute,
  requireAuthenticatedRoute,
  requireAuthenticatedRouteOrForbidden,
  requireOnboardingRoute,
} from './presentation/route-guards';
