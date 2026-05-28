import { createHash } from 'node:crypto';

import i18n from '@/platform/lib/i18n';

import type { EmailGateway } from '@/modules/email';
import { TemplateLoginCode } from '@/modules/email/presentation';

import type {
  AuthEmailPort,
  SendSignInOtpInput,
} from '../../application/ports/auth-email-port';

const signInOtpIdempotencyKey = (input: SendSignInOtpInput) => {
  const digest = createHash('sha256')
    .update(
      `${input.email.trim().toLowerCase()}|${input.otp}|${input.language}`
    )
    .digest('hex');

  return `auth:sign-in-otp:v1:${digest}`;
};

export class AuthEmailPortResend implements AuthEmailPort {
  constructor(private readonly emailGateway: EmailGateway) {}

  async sendSignInOtp(input: SendSignInOtpInput): Promise<void> {
    const t = i18n.getFixedT(input.language, 'emails');

    await this.emailGateway.sendEmail({
      to: input.email,
      subject: t('loginCode.subject'),
      template: (
        <TemplateLoginCode language={input.language} code={input.otp} />
      ),
      idempotencyKey: signInOtpIdempotencyKey(input),
      metadata: {
        source: 'auth.signInOtp',
        language: input.language,
      },
    });
  }
}
