import { adminClient, emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { envClient } from '@/env/client';

export const authClient = createAuthClient({
  baseURL: `${envClient.VITE_BASE_URL}/api/auth`,
  plugins: [adminClient(), emailOTPClient()],
});
