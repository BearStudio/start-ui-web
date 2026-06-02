import { Result } from '@swan-io/boxed';
import { createHash } from 'node:crypto';

import i18n from '@/platform/lib/i18n';

import type { AuthEmailPort, SendSignInOtpInput } from '@/modules/auth';
import type { EmailGateway } from '@/modules/email';
import { TemplateLoginCode } from '@/modules/email/presentation';
import {
  toEmailIdempotencyKey,
  toEmailRecipientList,
} from '@/modules/kernel/domain/ids';

const signInOtpIdempotencyKey = (input: SendSignInOtpInput) => {
  const digest = createHash('sha256')
    .update(
      `${input.email.trim().toLowerCase()}|${input.otp}|${input.language}`
    )
    .digest('hex');

  return toEmailIdempotencyKey(`auth:sign-in-otp:v1:${digest}`);
};

export class AuthEmailPortEmailGateway implements AuthEmailPort {
  constructor(private readonly emailGateway: EmailGateway) {}

  async sendSignInOtp(
    input: SendSignInOtpInput
  ): ReturnType<AuthEmailPort['sendSignInOtp']> {
    const t = i18n.getFixedT(input.language, 'emails');

    const result = await this.emailGateway.sendEmail({
      to: toEmailRecipientList(input.email),
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
    if (result.isError()) return Result.Error(result.getError());
    return Result.Ok({ type: 'auth_sign_in_otp_sent' });
  }
}
