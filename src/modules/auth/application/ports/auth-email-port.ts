import type { ApplicationResult } from '@/modules/kernel/application/result';

export type SendSignInOtpInput = {
  email: string;
  otp: string;
  language: string;
};

export type AuthEmailSendSignInOtpOutcome = {
  type: 'auth_sign_in_otp_sent';
};

export interface AuthEmailPort {
  sendSignInOtp(
    input: SendSignInOtpInput
  ): Promise<ApplicationResult<AuthEmailSendSignInOtpOutcome>>;
}
