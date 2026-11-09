import { cimd } from '@better-auth/cimd';
import { fetchClientMetadataResource } from '@better-auth/cimd/node';
import { expo } from '@better-auth/expo';
import { mcp } from '@better-auth/mcp';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, emailOTP, jwt, openAPI } from 'better-auth/plugins';
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
import { MCP_RESOURCE, MCP_SCOPES_LIST } from '@/server/mcp/config';
import { getUserLanguage } from '@/server/utils';

export type Auth = typeof auth;
export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      new URL(envClient.VITE_BASE_URL).host,
      ...(envServer.AUTH_ALLOWED_HOSTS ?? []),
    ],
  },
  session: {
    expiresIn: envServer.AUTH_SESSION_EXPIRATION_IN_SECONDS,
    updateAge: envServer.AUTH_SESSION_UPDATE_AGE_IN_SECONDS,
  },
  trustedOrigins: envServer.AUTH_TRUSTED_ORIGINS,
  // The jwt plugin /token endpoint would mint session JWTs signed with the
  // same key as OAuth access tokens, so it is disabled
  disabledPaths: ['/token'],
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
    /**
     * Allows an Expo native app to use auth, can be deleted if not needed.
     * disableOriginOverride: workaround for a crash in onRequest. Learn more at:
     * https://github.com/better-auth/better-auth/issues/1058
     */
    expo({ disableOriginOverride: true }),
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
          .with('change-email', async () => {
            throw new Error(
              'change-email email not implemented, update the /app/server/auth.tsx file'
            );
          })
          .exhaustive();
      },
    }),
    /**
     * OAuth 2.1 authorization server for MCP clients (Claude, Cursor...).
     * Signs access tokens with the jwt plugin keys (exposed at /api/auth/jwks).
     * Learn more: https://better-auth.com/docs/plugins/mcp
     */
    jwt({ disableSettingJwtHeader: true }),
    mcp({
      loginPage: '/login',
      consentPage: '/oauth/consent',
      resource: MCP_RESOURCE,
      scopes: [
        'openid',
        'profile',
        'email',
        'offline_access',
        ...MCP_SCOPES_LIST,
      ],
      // Required with Prisma on PostgreSQL: declare the MCP resource scopes.
      // offline_access is needed for refresh tokens to be rotated
      resources: [
        {
          identifier: MCP_RESOURCE,
          allowedScopes: [...MCP_SCOPES_LIST, 'offline_access'],
        },
      ],
      // Apply resources config changes to the already seeded database rows
      resourceSeedMode: 'merge',
      // Do not allow replaying a rotated refresh token
      refreshTokenReuseInterval: 0,
      ...(envServer.MCP_ALLOW_DYNAMIC_CLIENT_REGISTRATION
        ? {
            allowDynamicClientRegistration: true,
            allowUnauthenticatedClientRegistration: true,
            clientRegistrationDefaultApplicationType: 'infer',
            clientRegistrationDefaultScopes: [
              'openid',
              'offline_access',
              ...MCP_SCOPES_LIST,
            ],
          }
        : undefined),
    }),
    // Client ID Metadata Documents: MCP clients identify themselves with an
    // HTTPS URL instead of registering (preferred by the MCP spec)
    cimd({
      fetchClientMetadataResource,
      metadataProfile: 'mcp-2026-07-28',
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
