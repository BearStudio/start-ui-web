import nodemailer, { type SendMailOptions } from 'nodemailer';
import { ReactElement } from 'react';
import { render, toPlainText } from 'react-email';

import { envClient } from '@/env/client';
import { envServer } from '@/env/server';

// eslint-disable-next-line sonarjs/no-clear-text-protocols
const transport = nodemailer.createTransport(envServer.EMAIL_SERVER);

export const sendEmail = async ({
  template,
  ...options
}: Omit<SendMailOptions, 'html' | 'text'> &
  Required<Pick<SendMailOptions, 'subject'>> & { template: ReactElement }) => {
  if (envClient.VITE_IS_DEMO) {
    return;
  }

  const html = await render(template);
  const text = toPlainText(html);
  return transport.sendMail({
    from: envServer.EMAIL_FROM,
    html,
    text,
    ...options,
  });
};
