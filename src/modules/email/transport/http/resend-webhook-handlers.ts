import { Result } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

import {
  EMAIL_PROVIDER_RESEND,
  type EmailStatus,
  type EmailUseCases,
} from '@/modules/email';
import type { Logger } from '@/modules/kernel';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import {
  toEmailProviderMessageId,
  toEmailRecipientList,
  toEmailWebhookEventId,
} from '@/modules/kernel/domain/ids';

type VerifyResendWebhookInput = {
  payload: string;
  headers: {
    id: string;
    timestamp: string;
    signature: string;
  };
};

type ResendWebhookEvent = {
  created_at: string;
  data: unknown;
  type: string;
};

type TrackedResendEmailEvent = ResendWebhookEvent & {
  data: {
    email_id: string;
    subject: string;
    to: string[];
  };
  type: keyof typeof resendEmailStatusByEventType;
};

type ResendWebhookVerifier = {
  verify(input: VerifyResendWebhookInput): ResendWebhookEvent;
};

type ResendWebhookHandlerDeps = {
  getUseCases: () => EmailUseCases;
  logger?: Pick<Logger, 'warn'>;
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTrackedEmailEvent = (
  event: ResendWebhookEvent
): event is TrackedResendEmailEvent =>
  event.type in resendEmailStatusByEventType &&
  typeof event.created_at === 'string' &&
  isRecord(event.data) &&
  typeof event.data.email_id === 'string' &&
  typeof event.data.subject === 'string' &&
  Array.isArray(event.data.to) &&
  event.data.to.every((recipient) => typeof recipient === 'string');

const recipientFromEvent = (event: TrackedResendEmailEvent) =>
  toEmailRecipientList(event.data.to.join(', '));

export const createResendWebhookHandlers = ({
  getUseCases,
  logger,
  verifier,
}: ResendWebhookHandlerDeps) => {
  const receive = async (request: Request) => {
    const payload = await request.text();
    let resendSdkHeaders: VerifyResendWebhookInput['headers'];
    let event: ResendWebhookEvent;

    try {
      resendSdkHeaders = {
        id: requiredHeader(request.headers, 'svix-id'),
        timestamp: requiredHeader(request.headers, 'svix-timestamp'),
        signature: requiredHeader(request.headers, 'svix-signature'),
      };
      event = verifier.verify({ payload, headers: resendSdkHeaders });
    } catch (error) {
      logger?.warn({
        details: {
          provider: EMAIL_PROVIDER_RESEND,
          reason: error instanceof Error ? error.message : 'unknown',
        },
        event: 'security.webhook_signature_rejected',
      });
      throw error;
    }

    if (!isTrackedEmailEvent(event)) {
      return Response.json({ ok: true, ignored: true });
    }

    const result = await getUseCases().processStatusEvent({
      provider: EMAIL_PROVIDER_RESEND,
      externalId: toEmailProviderMessageId(event.data.email_id),
      recipient: recipientFromEvent(event),
      subject: event.data.subject,
      status: resendEmailStatusByEventType[event.type],
      webhookEventId: toEmailWebhookEventId(resendSdkHeaders.id),
      providerEventType: event.type,
      providerEventCreatedAt: event.created_at,
      metadata: {
        resendEvent: event,
      },
    });

    return match(result)
      .with(Result.P.Error(P.select()), (error) => {
        throw error;
      })
      .with(Result.P.Ok({ type: 'email_status_event_processed' }), () =>
        Response.json({ ok: true, duplicate: false })
      )
      .with(Result.P.Ok({ type: 'email_status_event_duplicate' }), () =>
        Response.json({ ok: true, duplicate: true })
      )
      .exhaustive();
  };

  return { receive };
};

export type ResendWebhookHandlers = ReturnType<
  typeof createResendWebhookHandlers
>;
