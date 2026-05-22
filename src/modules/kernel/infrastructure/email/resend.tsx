import type { ReactElement } from 'react';
import { type CreateEmailOptions, Resend } from 'resend';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { env } from '@/modules/kernel/infrastructure/config/env';

const resend = new Resend(env.RESEND_API_KEY);

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
  if (env.VITE_IS_DEMO || env.EMAIL_DELIVERY_DISABLED) {
    return;
  }

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
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
