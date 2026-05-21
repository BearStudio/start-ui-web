import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import type { MailOptions } from 'nodemailer/lib/sendmail-transport';
import { ReactElement } from 'react';

import { env } from '@/modules/kernel/infrastructure/config/env';

// eslint-disable-next-line sonarjs/no-clear-text-protocols
const transport = nodemailer.createTransport(env.EMAIL_SERVER);

export const sendEmail = async ({
  template,
  ...options
}: Omit<MailOptions, 'html'> &
  Required<Pick<MailOptions, 'subject'>> & { template: ReactElement }) => {
  if (env.VITE_IS_DEMO || env.EMAIL_DELIVERY_DISABLED) {
    return;
  }

  const html = await render(template);
  return transport.sendMail({
    from: env.EMAIL_FROM,
    html,
    ...options,
  });
};
