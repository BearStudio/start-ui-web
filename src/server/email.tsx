import { render } from '@react-email/render';
import nodemailer, { type SendMailOptions } from 'nodemailer';
import { ReactElement } from 'react';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import { envClient } from '@/env/client';
import { envServer } from '@/env/server';

// eslint-disable-next-line sonarjs/no-clear-text-protocols
const transport = nodemailer.createTransport(envServer.EMAIL_SERVER);

export const sendEmail = async ({
  template,
  ...options
}: Omit<SendMailOptions, 'html'> &
  Required<Pick<SendMailOptions, 'subject'>> & { template: ReactElement }) => {
  if (envClient.VITE_IS_DEMO) {
    return;
  }

  const html = await render(template);
  return transport.sendMail({
    from: envServer.EMAIL_FROM,
    html,
    ...options,
  });
};

export const previewEmailRoute = async (
  template: string,
  props: Record<string, string>
) => {
  let Email;
  try {
    const EmailModule = await import(`../emails/templates/${template}.tsx`);
    Email = EmailModule.default;
  } catch {
    return new Response('Template not found', {
      status: 404,
    });
  }

  const html = await render(
    <Email language={props?.language ?? DEFAULT_LANGUAGE_KEY} {...props} />
  );

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
};
