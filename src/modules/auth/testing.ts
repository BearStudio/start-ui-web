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
export {
  hasScopePermission,
  scopeUserId,
} from './application/scope-authorization';
export type { AuthSession } from './domain/session';
export { createAuthUseCases } from './factory';
export { isBlockedBetterAuthHttpPath } from './infrastructure/better-auth/auth-http-exposure';
export {
  AccountRepositoryDrizzle,
  createAccountRepository,
} from './infrastructure/drizzle/account-repository-drizzle';
export * as authDrizzleSchema from './infrastructure/drizzle/schema';
export {
  createUserRepository,
  UserRepositoryDrizzle,
} from './infrastructure/drizzle/user-repository-drizzle';
