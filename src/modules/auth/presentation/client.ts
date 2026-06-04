import { useMatches } from '@tanstack/react-router';
import { isMatching, match, P } from 'ts-pattern';

import {
  type CurrentSession,
  hasRolePermission,
  parseRole,
  type Permission,
  type Role,
} from '@/modules/auth';

import {
  betterAuthBrowserClient,
  type BetterAuthSocialProvider,
} from './better-auth-client';

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
const authSignOutErrorCode = 'SIGN_OUT_FAILED';

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

const hasRedirectUrl = isMatching({
  url: P.when(
    (url): url is string => typeof url === 'string' && url.length > 0
  ),
});

const readRedirectUrl = (value: unknown) =>
  hasRedirectUrl(value) ? value.url : undefined;

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

export const createUseAuthSession =
  <TQueryResult>(
    useCurrentSessionQuery: (
      initialData?: CurrentSession | null
    ) => TQueryResult
  ) =>
  () => {
    const routeSession = useRouteCurrentSession();
    return useCurrentSessionQuery(routeSession);
  };

export const startSignIn = async (
  input: StartSignInInput
): Promise<AuthClientResult<StartSignInResult>> => {
  try {
    return await match(input)
      .with({ strategy: 'email-otp' }, async ({ email, redirectTo }) => {
        const response = await betterAuthBrowserClient.sendEmailOtp({ email });
        return mapProviderResponse(response, {
          status: 'verification_required' as const,
          email,
          redirectTo,
        });
      })
      .with({ strategy: 'social' }, async ({ provider, redirectTo }) => {
        const response = await betterAuthBrowserClient.signInSocial({
          provider,
          callbackURL: redirectTo ?? '/',
          errorCallbackURL: '/login/error',
        });
        const redirectUrl = readRedirectUrl(response.data);

        return mapProviderResponse(
          response,
          redirectUrl
            ? { status: 'redirect' as const, url: redirectUrl }
            : { status: 'complete' as const }
        );
      })
      .exhaustive();
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
    const response = await fetch('/logout', {
      credentials: 'same-origin',
      method: 'POST',
    });

    if (!response.ok) {
      return {
        ok: false,
        code: authSignOutErrorCode,
        message: response.statusText || `HTTP error ${response.status}`,
      };
    }

    return { ok: true, value: undefined };
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

export { authErrorCodes } from './better-auth-client';
