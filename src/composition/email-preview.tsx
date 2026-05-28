import { render } from '@react-email/render';
import type { ReactElement } from 'react';

import { DEFAULT_LANGUAGE_KEY } from '@/platform/lib/i18n/constants';

import { TemplateLoginCode } from '@/modules/email/presentation';

type PreviewEmailComponent = (props: Record<string, string>) => ReactElement;

const emailTemplates: Record<string, PreviewEmailComponent> = {
  'login-code': TemplateLoginCode as PreviewEmailComponent,
};

type EmailPreviewHandlerDeps = {
  enabled: boolean;
  preview: (
    template: string,
    props: Record<string, string>
  ) => Promise<Response>;
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

export const createEmailPreviewRequestHandler =
  ({ enabled, preview }: EmailPreviewHandlerDeps) =>
  async (request: Request, template: string) => {
    if (!enabled) {
      return new Response(undefined, {
        status: 404,
      });
    }

    const url = new URL(request.url);
    const props = Object.fromEntries(url.searchParams);
    return preview(template, props);
  };

export const handleEmailPreviewRequest = createEmailPreviewRequestHandler({
  enabled: !import.meta.env.PROD,
  preview: previewEmailRoute,
});
