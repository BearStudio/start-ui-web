export type {
  AuthEmailPort,
  SendSignInOtpInput,
} from './application/ports/auth-email-port';
export type { AuthHttpGateway } from './application/ports/auth-http-gateway';
export type {
  AuthorizationGateway,
  AuthorizationPermission,
} from './application/ports/authorization-gateway';
export type { SessionGateway } from './application/ports/session-gateway';
export type { UserAdminGateway } from './application/ports/user-admin-gateway';
export {
  hasScopePermission,
  scopeUserId,
} from './application/scope-authorization';
export type { AuthUseCaseDeps } from './application/use-cases/types';
export {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_EMAIL_OTP_MOCKED,
  isAuthSignupEnabled,
} from './domain/auth-policy';
export {
  defaultUserPermissions,
  hasRolePermission,
  isRole,
  parseRole,
  type Permission,
  permissionStatements,
  type Role,
  rolePermissions,
  rolesNames,
  zRole,
} from './domain/permissions';
export {
  type CurrentSession,
  type RequestScope,
  sanitizeCurrentSession,
  scopeFromUser,
  scopeKeyFromScope,
  scopeKeyFromSession,
} from './domain/request-scope';
export type {
  AuthenticatedSession,
  AuthenticatedUser,
  AuthSession,
} from './domain/session';
export { type AuthUseCases, createAuthUseCases } from './factory';
