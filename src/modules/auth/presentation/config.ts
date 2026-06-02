import { envClient } from '@/platform/env/client';

import {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_EMAIL_OTP_MOCKED,
  isAuthSignupEnabled,
} from '@/modules/auth';

export { AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES, AUTH_EMAIL_OTP_MOCKED };

export const AUTH_SIGNUP_ENABLED = isAuthSignupEnabled({
  isDemo: envClient.VITE_IS_DEMO,
});
