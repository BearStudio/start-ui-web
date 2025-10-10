import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, emailOTP, openAPI } from 'better-auth/plugins';
import { match } from 'ts-pattern';

import i18n from '@/lib/i18n';

import TemplateLoginCode from '@/emails/templates/login-code';
import { envClient } from '@/env/client';
import { envServer } from '@/env/server';
import {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_EMAIL_OTP_MOCKED,
  AUTH_SIGNUP_ENABLED,
} from '@/features/auth/config';
import { permissions } from '@/features/auth/permissions';
import { db } from '@/server/db';
import { sendEmail } from '@/server/email';
import { getUserLanguage } from '@/server/utils';

export type Auth = typeof auth;
export const auth = betterAuth({
  session: {
    expiresIn: envServer.AUTH_SESSION_EXPIRATION_IN_SECONDS,
    updateAge: envServer.AUTH_SESSION_UPDATE_AGE_IN_SECONDS,
  },
  trustedOrigins: envServer.AUTH_TRUSTED_ORIGINS,
  database: prismaAdapter(db, {
    provider: 'postgresql',
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
      enabled: !!(envServer.GITHUB_CLIENT_ID && envServer.GITHUB_CLIENT_SECRET),
      clientId: envServer.GITHUB_CLIENT_ID!,
      clientSecret: envServer.GITHUB_CLIENT_SECRET!,
      disableImplicitSignUp: !AUTH_SIGNUP_ENABLED,
    },
  },

  plugins: [
    expo(), // Allows an Expo native app to use auth, can be delete if no needed
    openAPI({
      disableDefaultReference: true, // Use custom exposition in /routes/api/openapi folder
    }),
    admin({
      ...permissions,
    }),
    emailOTP({
      disableSignUp: !AUTH_SIGNUP_ENABLED,
      expiresIn: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES * 60,
      // Use predictable mocked code in dev and demo
      ...(import.meta.env.DEV || envClient.VITE_IS_DEMO
        ? { generateOTP: () => AUTH_EMAIL_OTP_MOCKED }
        : undefined),
      async sendVerificationOTP({ email, otp, type }) {
        await match(type)
          .with('sign-in', async () => {
            await sendEmail({
              to: email,
              subject: i18n.t('emails:loginCode.subject', {
                lng: getUserLanguage(),
              }),
              template: (
                <TemplateLoginCode language={getUserLanguage()} code={otp} />
              ),
            });
          })
          .with('email-verification', async () => {
            throw new Error(
              'email-verification email not implemented, update the /app/server/auth.tsx file'
            );
          })
          .with('forget-password', async () => {
            throw new Error(
              'forget-password email not implemented, update the /app/server/auth.tsx file'
            );
          })
          .exhaustive();
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (envClient.VITE_IS_DEMO) throw new Error('DEMO MODE');
          return { data: user };
        },
      },
      update: {
        before: async (user) => {
          if (envClient.VITE_IS_DEMO) throw new Error('DEMO MODE');
          return { data: user };
        },
      },
    },
  },
});
