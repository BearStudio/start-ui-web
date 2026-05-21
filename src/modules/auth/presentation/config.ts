import { envClient } from '@/env/client';

export {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_EMAIL_OTP_MOCKED,
} from '../domain/auth-policy';

export const AUTH_SIGNUP_ENABLED = envClient.VITE_IS_DEMO ? false : true;
