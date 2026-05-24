import {
  type AuthEmailPort,
  type AuthorizationGateway,
  createAuthUseCases,
  type SessionGateway,
  type UserAdminGateway,
} from '@/modules/auth';
import { AuthEmailPortResend } from '@/modules/auth/infrastructure/better-auth/auth-email-port-resend';
import { AuthorizationGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/authorization-gateway-better-auth';
export {
  type Auth,
  auth,
  createAuth,
  getDefaultAuth as getAuth,
} from '@/modules/auth/infrastructure/better-auth/auth';
import { SessionGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/session-gateway-better-auth';
import { UserAdminGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/user-admin-gateway-better-auth';

import { createCachedFactory } from './shared/singleton';

export type AuthOverrides = {
  sessionGateway?: SessionGateway;
  authorizationGateway?: AuthorizationGateway;
  authEmailPort?: AuthEmailPort;
  userAdminGateway?: UserAdminGateway;
};

const buildAuthUseCases = (overrides?: AuthOverrides) =>
  createAuthUseCases({
    sessionGateway: overrides?.sessionGateway ?? new SessionGatewayBetterAuth(),
    authorizationGateway:
      overrides?.authorizationGateway ?? new AuthorizationGatewayBetterAuth(),
    authEmailPort: overrides?.authEmailPort ?? new AuthEmailPortResend(),
    userAdminGateway:
      overrides?.userAdminGateway ?? new UserAdminGatewayBetterAuth(),
  });

const factory = createCachedFactory(buildAuthUseCases);

export const getAuthUseCases = (overrides?: AuthOverrides) =>
  factory.get(overrides);

/** Test-only. */
export const __resetAuthComposition = () => factory.reset();
