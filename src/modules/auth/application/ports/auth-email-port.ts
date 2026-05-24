export type SendSignInOtpInput = {
  email: string;
  otp: string;
  language: string;
};

export interface AuthEmailPort {
  sendSignInOtp(input: SendSignInOtpInput): Promise<void>;
}
