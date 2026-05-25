import type { AuthUseCaseDeps } from './types';
import type { SendSignInOtpInput } from '../ports/auth-email-port';

export async function sendSignInOtp(
  deps: AuthUseCaseDeps,
  input: SendSignInOtpInput
): Promise<void> {
  return deps.authEmailPort.sendSignInOtp(input);
}
