import type { ApplicationResult } from '@/modules/kernel/application/result';
import type {
  EmailAddress,
  LanguageCode,
  OtpCode,
} from '@/modules/kernel/domain/ids';

export type SendSignInOtpInput = {
  email: EmailAddress;
  otp: OtpCode;
  language: LanguageCode;
};

export type AuthEmailSendSignInOtpOutcome = {
  type: 'auth_sign_in_otp_sent';
};

export interface AuthEmailPort {
  sendSignInOtp(
    input: SendSignInOtpInput
  ): Promise<ApplicationResult<AuthEmailSendSignInOtpOutcome>>;
}
