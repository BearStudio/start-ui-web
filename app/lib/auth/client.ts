import { adminClient, emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { envClient } from '@/env/client';

import { permissions } from './permissions';

export const authClient = createAuthClient({
  baseURL: `${envClient.VITE_BASE_URL}/api/auth`,
  plugins: [
    adminClient({
      ...permissions,
    }),
    emailOTPClient(),
  ],
});

export type Permission = Parameters<
  typeof authClient.admin.hasPermission
>['0']['permission'];
