import i18n from '@/platform/lib/i18n';

import { TemplateLoginCode } from '@/modules/email/presentation';
import { sendEmail } from '@/modules/kernel/infrastructure/email/resend';

import type {
  AuthEmailPort,
  SendSignInOtpInput,
} from '../../application/ports/auth-email-port';

export class AuthEmailPortResend implements AuthEmailPort {
  async sendSignInOtp(input: SendSignInOtpInput): Promise<void> {
    const t = i18n.getFixedT(input.language, 'emails');

    await sendEmail({
      to: input.email,
      subject: t('loginCode.subject'),
      template: (
        <TemplateLoginCode language={input.language} code={input.otp} />
      ),
    });
  }
}
