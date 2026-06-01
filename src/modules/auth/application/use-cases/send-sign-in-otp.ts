import type {
  AuthResult,
  AuthSendSignInOtpOutcome,
  AuthUseCaseDeps,
} from './types';
import type { SendSignInOtpInput } from '../ports/auth-email-port';

export async function sendSignInOtp(
  deps: AuthUseCaseDeps,
  input: SendSignInOtpInput
): Promise<AuthResult<AuthSendSignInOtpOutcome>> {
  return deps.authEmailPort.sendSignInOtp(input);
}
