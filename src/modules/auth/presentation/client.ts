import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc } from 'better-auth/plugins/admin/access';
import { createAuthClient } from 'better-auth/react';

import { envClient } from '@/platform/env/client';

import {
  hasRolePermission,
  parseRole,
  type Permission,
  permissionStatements,
  type Role,
  rolePermissions,
} from '../domain/permissions';

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
    typeof window === 'undefined'
      ? envClient.VITE_BASE_URL
      : window.location.origin,
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

export const authClient = betterAuthClient;
export const authErrorCodes = betterAuthClient.$ERROR_CODES;
export const useAuthSession = () => betterAuthClient.useSession();
export const signOut = () => betterAuthClient.signOut();
export const signInSocial = (
  input: Parameters<typeof betterAuthClient.signIn.social>[0]
) => betterAuthClient.signIn.social(input);
export const sendEmailOtp = (
  input: Parameters<typeof betterAuthClient.emailOtp.sendVerificationOtp>[0]
) => betterAuthClient.emailOtp.sendVerificationOtp(input);
export const signInEmailOtp = (
  input: Parameters<typeof betterAuthClient.signIn.emailOtp>[0]
) => betterAuthClient.signIn.emailOtp(input);
export const checkRolePermission = (input: {
  role: Role | string | null | undefined;
  permissions: Permission;
}) => {
  const role = parseRole(input.role);
  return role ? hasRolePermission(role, input.permissions) : false;
};
