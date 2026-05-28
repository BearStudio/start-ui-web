import type { ReactElement } from 'react';
import { type CreateEmailOptions, Resend } from 'resend';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { getEmailConfig } from '@/modules/kernel/infrastructure/config/email';
import { envClient } from '@/platform/env/client';

export function createResendClient(apiKey = getEmailConfig().resendApiKey) {
  return new Resend(apiKey);
}

let resend: ReturnType<typeof createResendClient> | undefined;

export function getDefaultResendClient() {
  resend ??= createResendClient();
  return resend;
}

type SendEmailOptions = {
  to: CreateEmailOptions['to'];
  subject: string;
  template: ReactElement;
  cc?: CreateEmailOptions['cc'];
  bcc?: CreateEmailOptions['bcc'];
  replyTo?: CreateEmailOptions['replyTo'];
  headers?: CreateEmailOptions['headers'];
  attachments?: CreateEmailOptions['attachments'];
  tags?: CreateEmailOptions['tags'];
};

export const sendEmail = async ({ template, ...options }: SendEmailOptions) => {
  if (envClient.VITE_IS_DEMO) {
    return;
  }

  const emailConfig = getEmailConfig();
  if (emailConfig.deliveryDisabled) {
    return;
  }

  const { data, error } = await getDefaultResendClient().emails.send({
    from: emailConfig.from,
    react: template,
    ...options,
  });

  if (error) {
    throw new AppError({
      code: 'EMAIL_SEND_FAILED',
      category: 'system',
      status: error.statusCode ?? 500,
      message: 'Failed to send email',
      details: {
        provider: 'resend',
        errorName: error.name,
        statusCode: error.statusCode,
      },
      cause: error,
    });
  }

  return data;
};
