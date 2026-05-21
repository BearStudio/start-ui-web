import { render } from '@react-email/render';
import type { ReactElement } from 'react';

import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

import TemplateLoginCode from '@/emails/templates/login-code';

type PreviewEmailComponent = (props: Record<string, string>) => ReactElement;

const emailTemplates: Record<string, PreviewEmailComponent> = {
  'login-code': TemplateLoginCode as PreviewEmailComponent,
};

export const previewEmailRoute = async (
  template: string,
  props: Record<string, string>
) => {
  const Email = emailTemplates[template];
  if (!Email) {
    return new Response('Template not found', {
      status: 404,
    });
  }

  const html = await render(
    <Email language={props.language ?? DEFAULT_LANGUAGE_KEY} {...props} />
  );

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
};
