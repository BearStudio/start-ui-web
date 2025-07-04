import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { envClient } from '@/env/client';
import type { Auth } from '@/server/auth';

import { permissions } from './permissions';

export const authClient = createAuthClient({
  baseURL: `${envClient.VITE_BASE_URL}/api/auth`,
  plugins: [
    inferAdditionalFields<Auth>(),
    adminClient({
      ...permissions,
    }),
    emailOTPClient(),
  ],
});
