import { useMatches } from '@tanstack/react-router';

import {
  hasRolePermission,
  parseRole,
  type Permission,
  type Role,
} from '../domain/permissions';
import type { CurrentSession } from '../domain/request-scope';
import {
  authErrorCodes,
  betterAuthBrowserClient,
  type BetterAuthSocialProvider,
} from './better-auth-client';
import { useCurrentSessionQuery } from './queries';

type AuthProviderError = {
  code?: string | null;
  message?: string | null;
};

type AuthProviderResponse<TData = unknown> = {
  data?: TData | null;
  error?: AuthProviderError | null;
};

export type AuthClientResult<TValue = void> =
  | { ok: true; value: TValue }
  | { ok: false; code: string; message?: string };

export type AuthSignInProvider = BetterAuthSocialProvider;

export type StartSignInInput =
  | {
      strategy: 'email-otp';
      email: string;
      redirectTo?: string;
    }
  | {
      strategy: 'social';
      provider: AuthSignInProvider;
      redirectTo?: string;
    };

export type StartSignInResult =
  | {
      status: 'verification_required';
      email: string;
      redirectTo?: string;
    }
  | {
      status: 'redirect';
      url: string;
    }
  | {
      status: 'complete';
    };

const authUnknownErrorCode = 'UNKNOWN_ERROR';

const providerErrorResult = (
  error: AuthProviderError | null | undefined
): AuthClientResult<never> => ({
  ok: false,
  code: error?.code || authUnknownErrorCode,
  ...(error?.message ? { message: error.message } : {}),
});

const unknownErrorResult = (error: unknown): AuthClientResult<never> => ({
  ok: false,
  code: authUnknownErrorCode,
  message: error instanceof Error ? error.message : undefined,
});

const readRedirectUrl = (value: unknown) => {
  if (!value || typeof value !== 'object') return undefined;
  const url = (value as { url?: unknown }).url;
  return typeof url === 'string' && url ? url : undefined;
};

const mapProviderResponse = <TValue, TData = unknown>(
  response: AuthProviderResponse<TData>,
  value: TValue
): AuthClientResult<TValue> =>
  response.error ? providerErrorResult(response.error) : { ok: true, value };

type AuthRouteSessionContext = {
  currentSession?: unknown;
};

const selectRouteCurrentSession = (
  matches: ReadonlyArray<{ context?: unknown }>
) => {
  for (const match of [...matches].reverse()) {
    const context = match.context as AuthRouteSessionContext | undefined;

    if (context && 'currentSession' in context) {
      return context.currentSession ?? null;
    }
  }

  return undefined;
};

const useRouteCurrentSession = () =>
  useMatches({
    select: (matches): CurrentSession | null | undefined =>
      selectRouteCurrentSession(
        matches as ReadonlyArray<{ context?: unknown }>
      ) as CurrentSession | null | undefined,
    structuralSharing: false,
  });

export const useAuthSession = () => {
  const routeSession = useRouteCurrentSession();
  return useCurrentSessionQuery(routeSession);
};

export const startSignIn = async (
  input: StartSignInInput
): Promise<AuthClientResult<StartSignInResult>> => {
  try {
    if (input.strategy === 'email-otp') {
      const response = await betterAuthBrowserClient.sendEmailOtp({
        email: input.email,
      });
      return mapProviderResponse(response, {
        status: 'verification_required',
        email: input.email,
        redirectTo: input.redirectTo,
      });
    }

    const response = await betterAuthBrowserClient.signInSocial({
      provider: input.provider,
      callbackURL: input.redirectTo ?? '/',
      errorCallbackURL: '/login/error',
    });
    const redirectUrl = readRedirectUrl(response.data);

    return mapProviderResponse(
      response,
      redirectUrl
        ? { status: 'redirect', url: redirectUrl }
        : { status: 'complete' }
    );
  } catch (error) {
    return unknownErrorResult(error);
  }
};

export const verifyEmailOtp = async (input: {
  email: string;
  otp: string;
}): Promise<AuthClientResult<void>> => {
  try {
    const response = await betterAuthBrowserClient.signInEmailOtp(input);
    return mapProviderResponse(response, undefined);
  } catch (error) {
    return unknownErrorResult(error);
  }
};

export const signOut = async (): Promise<AuthClientResult<void>> => {
  try {
    const response = await betterAuthBrowserClient.signOut();
    return mapProviderResponse(response, undefined);
  } catch (error) {
    return unknownErrorResult(error);
  }
};

export const checkRolePermission = (input: {
  role: Role | string | null | undefined;
  permissions: Permission;
}) => {
  const role = parseRole(input.role);
  return role ? hasRolePermission(role, input.permissions) : false;
};

export { authErrorCodes };
