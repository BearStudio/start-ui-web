import { Result } from '@swan-io/boxed';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, emailOTP, openAPI } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { match } from 'ts-pattern';

import {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_EMAIL_OTP_MOCKED,
} from '@/modules/auth';
import { AUTH_SIGNUP_ENABLED } from '@/modules/auth/presentation/config';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { DEMO_MODE_ERROR } from '@/modules/kernel/domain/errors/demo-mode';
import { getBetterAuthConfig } from '@/modules/kernel/infrastructure/config/auth';
import {
  type Database,
  getDefaultDbClient,
} from '@/modules/kernel/infrastructure/db/client';
import { getUserLanguage } from '@/modules/kernel/transport/tanstack/user-language';
import { envClient } from '@/platform/env/client';

import { createAuthCookieSecurityOptions } from './cookie-options';
import {
  type CreateAuthOptions,
  normalizeCreateAuthInput,
} from './create-auth-options';
import { betterAuthPermissions } from './permissions';

const missingAuthEmailPort = {
  async sendSignInOtp() {
    return Result.Error(
      new AppError({
        code: 'AUTH_EMAIL_PORT_NOT_CONFIGURED',
        category: 'system',
        status: 500,
        message: 'Auth email port is not configured',
      })
    );
  },
};

export function createAuth(input?: Database | CreateAuthOptions) {
  const options = normalizeCreateAuthInput(input);
  const database = options.database ?? getDefaultDbClient();
  const authEmailPort = options.authEmailPort ?? missingAuthEmailPort;
  const authConfig = getBetterAuthConfig();

  return betterAuth({
    secret: authConfig.secret,
    baseURL: {
      allowedHosts: [
        new URL(envClient.VITE_BASE_URL).host,
        ...(authConfig.allowedHosts ?? []),
      ],
    },
    session: {
      expiresIn: authConfig.sessionExpirationInSeconds,
      updateAge: authConfig.sessionUpdateAgeInSeconds,
    },
    advanced: createAuthCookieSecurityOptions(envClient.VITE_BASE_URL),
    trustedOrigins: authConfig.trustedOrigins,
    database: drizzleAdapter(database, {
      provider: 'pg',
    }),
    user: {
      additionalFields: {
        onboardedAt: {
          type: 'date',
        },
      },
    },
    onAPIError: {
      throw: true,
      errorURL: '/login/error',
    },
    socialProviders: {
      github: {
        enabled: !!(authConfig.githubClientId && authConfig.githubClientSecret),
        clientId: authConfig.githubClientId!,
        clientSecret: authConfig.githubClientSecret!,
        disableImplicitSignUp: !AUTH_SIGNUP_ENABLED,
      },
    },

    plugins: [
      openAPI({
        disableDefaultReference: true,
      }),
      admin({
        ...betterAuthPermissions,
      }),
      emailOTP({
        disableSignUp: !AUTH_SIGNUP_ENABLED,
        expiresIn: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES * 60,
        // Use predictable mocked code in dev and demo
        ...(envClient.DEV || envClient.VITE_IS_DEMO
          ? { generateOTP: () => AUTH_EMAIL_OTP_MOCKED }
          : undefined),
        async sendVerificationOTP({ email, otp, type }) {
          await match(type)
            .with('sign-in', async () => {
              const result = await authEmailPort.sendSignInOtp({
                email,
                otp,
                language: getUserLanguage(),
              });
              if (result.isError()) throw result.getError();
            })
            .with('email-verification', async () => {
              throw new AppError({
                code: 'AUTH_EMAIL_VERIFICATION_NOT_IMPLEMENTED',
                category: 'system',
                status: 500,
                message:
                  'email-verification email not implemented, update the /app/server/auth.tsx file',
              });
            })
            .with('forget-password', async () => {
              throw new AppError({
                code: 'AUTH_FORGET_PASSWORD_NOT_IMPLEMENTED',
                category: 'system',
                status: 500,
                message:
                  'forget-password email not implemented, update the /app/server/auth.tsx file',
              });
            })
            .with('change-email', async () => {
              throw new AppError({
                code: 'AUTH_CHANGE_EMAIL_NOT_IMPLEMENTED',
                category: 'system',
                status: 500,
                message:
                  'change-email email not implemented, update the /app/server/auth.tsx file',
              });
            })
            .exhaustive();
        },
      }),
      tanstackStartCookies(),
    ],
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (envClient.VITE_IS_DEMO) {
              throw new AppError({
                code: DEMO_MODE_ERROR,
                category: 'bad_request',
                status: 405,
                message: 'DEMO MODE',
              });
            }
            return { data: user };
          },
        },
        update: {
          before: async (user) => {
            if (envClient.VITE_IS_DEMO) {
              throw new AppError({
                code: DEMO_MODE_ERROR,
                category: 'bad_request',
                status: 405,
                message: 'DEMO MODE',
              });
            }
            return { data: user };
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

let defaultAuth: Auth | undefined;

export function getDefaultAuth() {
  defaultAuth ??= createAuth();
  return defaultAuth;
}

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getDefaultAuth();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
