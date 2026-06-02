export const AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES = 5;
export const AUTH_EMAIL_OTP_MOCKED = '000000';

export const isAuthSignupEnabled = (input: { isDemo: boolean }) =>
  !input.isDemo;
