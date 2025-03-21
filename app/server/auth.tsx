import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, emailOTP, openAPI } from 'better-auth/plugins';

import { permissions } from '@/lib/auth/permissions';
import i18n from '@/lib/i18n';

import EmailLoginCode from '@/emails/templates/login-code';
import { envClient } from '@/env/client';
import { envServer } from '@/env/server';
import {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_EMAIL_OTP_MOCKED,
} from '@/features/auth/utils';
import { db } from '@/server/db';
import { sendEmail } from '@/server/email';
import { getUserLanguage } from '@/server/i18n';

export const auth = betterAuth({
  session: {
    expiresIn: envServer.SESSION_EXPIRATION_IN_SECONDS,
    updateAge: envServer.SESSION_UPDATE_AGE_IN_SECONDS,
  },
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      enabled: !!(envServer.GITHUB_CLIENT_ID && envServer.GITHUB_CLIENT_SECRET),
      clientId: envServer.GITHUB_CLIENT_ID!,
      clientSecret: envServer.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [
    openAPI({
      disableDefaultReference: true, // Use custom exposition in /routes/api folder
    }),
    admin({
      ...permissions,
    }),
    emailOTP({
      disableSignUp: true,
      expiresIn: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES * 60,
      // Use predictable mocked code in dev and demo
      ...(import.meta.env.DEV || envClient.VITE_IS_DEMO
        ? { generateOTP: () => AUTH_EMAIL_OTP_MOCKED }
        : undefined),
      async sendVerificationOTP({ email, otp }) {
        // TODO handle type
        await sendEmail({
          to: email,
          subject: i18n.t('emails:loginCode.subject', {
            lng: getUserLanguage(),
          }),
          template: (
            <EmailLoginCode
              language={getUserLanguage()}
              name={''} // TODO better handling? should we check if the user exist?
              code={otp}
            />
          ),
        });
      },
    }),
  ],
});
