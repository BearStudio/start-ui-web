export type {
  AuthenticatedSession,
  AuthenticatedUser,
  AuthSession,
} from './domain/session';
export type {
  AuthEmailPort,
  SendSignInOtpInput,
} from './application/ports/auth-email-port';
export type {
  AuthorizationGateway,
  AuthorizationPermission,
} from './application/ports/authorization-gateway';
export type { SessionGateway } from './application/ports/session-gateway';
export type { UserAdminGateway } from './application/ports/user-admin-gateway';
export type {
  AuthUseCaseDeps,
  UseCaseResult,
} from './application/use-cases/types';
export { createAuthUseCases, type AuthUseCases } from './factory';
export {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_EMAIL_OTP_MOCKED,
} from './domain/auth-policy';
export {
  defaultUserPermissions,
  hasRolePermission,
  type Permission,
  permissionStatements,
  type Role,
  rolePermissions,
  rolesNames,
  zRole,
} from './domain/permissions';
