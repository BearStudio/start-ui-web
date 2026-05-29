import type { WebhookEventPayload } from 'resend';

import {
  EMAIL_PROVIDER_RESEND,
  type EmailStatus,
  type EmailUseCases,
} from '@/modules/email';
import { AppError } from '@/modules/kernel/domain/errors/app-error';

type VerifyResendWebhookInput = {
  payload: string;
  headers: {
    id: string;
    timestamp: string;
    signature: string;
  };
};

type ResendWebhookVerifier = {
  verify(input: VerifyResendWebhookInput): WebhookEventPayload;
};

type ResendWebhookHandlerDeps = {
  getUseCases: () => EmailUseCases;
  verifier: ResendWebhookVerifier;
};

const resendEmailStatusByEventType = {
  'email.sent': 'sent',
  'email.scheduled': 'scheduled',
  'email.delivered': 'delivered',
  'email.delivery_delayed': 'delivery_delayed',
  'email.complained': 'complained',
  'email.bounced': 'bounced',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.received': 'received',
  'email.failed': 'failed',
  'email.suppressed': 'suppressed',
} satisfies Record<string, EmailStatus>;

const requiredHeader = (headers: Headers, name: string) => {
  const value = headers.get(name);
  if (value) return value;

  throw new AppError({
    code: 'EMAIL_WEBHOOK_MISSING_HEADER',
    category: 'bad_request',
    status: 400,
    message: 'Missing email webhook signature header',
    details: { header: name },
    exposeDetails: true,
  });
};

const isTrackedEmailEvent = (
  event: WebhookEventPayload
): event is Extract<
  WebhookEventPayload,
  { type: keyof typeof resendEmailStatusByEventType }
> =>
  event.type in resendEmailStatusByEventType &&
  'email_id' in event.data &&
  typeof event.data.email_id === 'string';

const recipientFromEvent = (
  event: Extract<WebhookEventPayload, { data: { to: string[] } }>
) => event.data.to.join(', ');

export const createResendWebhookHandlers = ({
  getUseCases,
  verifier,
}: ResendWebhookHandlerDeps) => {
  const receive = async (request: Request) => {
    const payload = await request.text();
    const resendSdkHeaders = {
      id: requiredHeader(request.headers, 'svix-id'),
      timestamp: requiredHeader(request.headers, 'svix-timestamp'),
      signature: requiredHeader(request.headers, 'svix-signature'),
    };

    const event = verifier.verify({ payload, headers: resendSdkHeaders });

    if (!isTrackedEmailEvent(event)) {
      return Response.json({ ok: true, ignored: true });
    }

    const result = await getUseCases().processStatusEvent({
      provider: EMAIL_PROVIDER_RESEND,
      externalId: event.data.email_id,
      recipient: recipientFromEvent(event),
      subject: event.data.subject,
      status: resendEmailStatusByEventType[event.type],
      webhookEventId: resendSdkHeaders.id,
      providerEventType: event.type,
      providerEventCreatedAt: event.created_at,
      metadata: {
        resendEvent: event,
      },
    });

    return Response.json({
      ok: true,
      duplicate: result.duplicate,
    });
  };

  return { receive };
};

export type ResendWebhookHandlers = ReturnType<
  typeof createResendWebhookHandlers
>;
