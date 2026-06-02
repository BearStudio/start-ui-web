import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc } from 'better-auth/plugins/admin/access';
import { createAuthClient } from 'better-auth/react';

import { envClient } from '@/platform/env/client';

import { permissionStatements, rolePermissions } from '@/modules/auth';

const ac = createAccessControl(permissionStatements);
const betterAuthClientPermissions = {
  ac,
  roles: {
    admin: ac.newRole({
      ...adminAc.statements,
      ...rolePermissions.admin,
    }),
    user: ac.newRole(rolePermissions.user),
  },
};

const betterAuthClient = createAuthClient({
  baseURL:
    typeof globalThis.window === 'undefined'
      ? envClient.VITE_BASE_URL
      : globalThis.window.location.origin,
  plugins: [
    inferAdditionalFields({
      user: {
        onboardedAt: {
          type: 'date',
        },
      },
    }),
    adminClient({
      ...betterAuthClientPermissions,
    }),
    emailOTPClient(),
  ],
});

export type BetterAuthSocialProvider = Parameters<
  typeof betterAuthClient.signIn.social
>[0]['provider'];

export const authErrorCodes = betterAuthClient.$ERROR_CODES;

export const betterAuthBrowserClient = {
  sendEmailOtp(input: { email: string }) {
    return betterAuthClient.emailOtp.sendVerificationOtp({
      email: input.email,
      type: 'sign-in',
    });
  },
  signInEmailOtp(input: { email: string; otp: string }) {
    return betterAuthClient.signIn.emailOtp(input);
  },
  signInSocial(input: {
    provider: BetterAuthSocialProvider;
    callbackURL: string;
    errorCallbackURL: string;
  }) {
    return betterAuthClient.signIn.social(input);
  },
  signOut() {
    return betterAuthClient.signOut();
  },
};
