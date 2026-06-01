import {
  type AuthEmailPort,
  type AuthHttpGateway,
  type AuthorizationGateway,
  createAuthUseCases,
  type SessionGateway,
  type UserAdminGateway,
} from '@/modules/auth';
import {
  type Auth,
  createAuth,
} from '@/modules/auth/infrastructure/better-auth/auth';
import { AuthEmailPortResend } from '@/modules/auth/infrastructure/better-auth/auth-email-port-resend';
import { AuthorizationGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/authorization-gateway-better-auth';
import { SessionGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/session-gateway-better-auth';
import { UserAdminGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/user-admin-gateway-better-auth';
import { ConfigurationError } from '@/modules/kernel/domain/errors/configuration-error';
import { getAuthProviderConfig } from '@/modules/kernel/infrastructure/config/auth';

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

type AuthHttpOverrides = AuthInstanceOverrides & {
  authHttpGateway?: AuthHttpGateway;
};

const buildAuthEmailPort = (overrides?: AuthInstanceOverrides) =>
  overrides?.authEmailPort ?? new AuthEmailPortResend(getEmailGateway());

const assertBetterAuthProvider = () => {
  const { provider } = getAuthProviderConfig();
  if (provider !== 'better-auth') {
    throw new ConfigurationError(
      `AUTH_PROVIDER=${provider} is not implemented in this build.`
    );
  }
};

const buildAuth = (overrides?: AuthInstanceOverrides) => {
  assertBetterAuthProvider();
  return createAuth({
    authEmailPort: buildAuthEmailPort(overrides),
  });
};

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

const buildAuthHttpGateway = (
  overrides?: AuthHttpOverrides
): AuthHttpGateway => {
  if (overrides?.authHttpGateway) return overrides.authHttpGateway;
  const authInstance = getAuth(overrides);

  return {
    handle: (request) => authInstance.handler(request),
  };
};

const authHttpFactory = createCachedFactory<AuthHttpGateway, AuthHttpOverrides>(
  buildAuthHttpGateway
);

export const getAuthHttpGateway = (overrides?: AuthHttpOverrides) =>
  authHttpFactory.get(overrides);

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
  authHttpFactory.reset();
};

export { createAuth };
export type { Auth };
