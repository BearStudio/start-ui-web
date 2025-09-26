import { envClient } from '@/env/client';

export const AUTH_SIGNUP_ENABLED = envClient.VITE_IS_DEMO ? false : true;
export const AUTH_EMAIL_OTP_MOCKED = '000000';
export const AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES = 5;
