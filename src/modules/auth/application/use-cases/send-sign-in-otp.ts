import type { SendSignInOtpInput } from '../ports/auth-email-port';
import type { AuthUseCaseDeps } from './types';

export async function sendSignInOtp(
  deps: AuthUseCaseDeps,
  input: SendSignInOtpInput
): Promise<void> {
  return deps.authEmailPort.sendSignInOtp(input);
}
