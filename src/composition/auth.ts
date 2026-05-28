import {
  type AuthEmailPort,
  type AuthorizationGateway,
  createAuthUseCases,
  type SessionGateway,
  type UserAdminGateway,
} from '@/modules/auth';
import { AuthEmailPortResend } from '@/modules/auth/infrastructure/better-auth/auth-email-port-resend';
import { AuthorizationGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/authorization-gateway-better-auth';
import {
  createAuth,
  type Auth,
} from '@/modules/auth/infrastructure/better-auth/auth';
import { SessionGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/session-gateway-better-auth';
import { UserAdminGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/user-admin-gateway-better-auth';

import { getEmailGateway } from './email';
import { createCachedFactory } from './shared/singleton';

export type AuthOverrides = {
  sessionGateway?: SessionGateway;
  authorizationGateway?: AuthorizationGateway;
  authEmailPort?: AuthEmailPort;
  userAdminGateway?: UserAdminGateway;
};

type AuthInstanceOverrides = {
  authEmailPort?: AuthEmailPort;
};

const buildAuthEmailPort = (overrides?: AuthInstanceOverrides) =>
  overrides?.authEmailPort ?? new AuthEmailPortResend(getEmailGateway());

const buildAuth = (overrides?: AuthInstanceOverrides) =>
  createAuth({
    authEmailPort: buildAuthEmailPort(overrides),
  });

const authFactory = createCachedFactory<Auth, AuthInstanceOverrides>(buildAuth);

export const getAuth = (overrides?: AuthInstanceOverrides) =>
  authFactory.get(overrides);

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAuth();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

const buildAuthUseCases = (overrides?: AuthOverrides) => {
  const authEmailPort = buildAuthEmailPort(overrides);
  const authInstance = getAuth({ authEmailPort });

  return createAuthUseCases({
    sessionGateway:
      overrides?.sessionGateway ?? new SessionGatewayBetterAuth(authInstance),
    authorizationGateway:
      overrides?.authorizationGateway ??
      new AuthorizationGatewayBetterAuth(authInstance),
    authEmailPort,
    userAdminGateway:
      overrides?.userAdminGateway ??
      new UserAdminGatewayBetterAuth(authInstance),
  });
};

const factory = createCachedFactory(buildAuthUseCases);

export const getAuthUseCases = (overrides?: AuthOverrides) =>
  factory.get(overrides);

/** Test-only. */
export const __resetAuthComposition = () => {
  factory.reset();
  authFactory.reset();
};

export { createAuth };
export type { Auth };
