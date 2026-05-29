import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import type { CreateEmailOptions, Resend } from 'resend';

import type { EmailStatusRepository } from '@/modules/email';
import {
  EMAIL_PROVIDER_RESEND,
  type EmailGateway,
  type EmailMetadata,
  type SendEmailParams,
  type SendEmailResult,
} from '@/modules/email';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { getEmailConfig } from '@/modules/kernel/infrastructure/config/email';
import { envClient } from '@/platform/env/client';

import { getDefaultResendClient } from './resend-client';

type EmailGatewayResendDeps = {
  statusRepository: EmailStatusRepository;
  resend?: Resend;
};

const recipientToStatusValue = (recipient: SendEmailParams['to']) =>
  Array.isArray(recipient) ? recipient.join(', ') : recipient;

const assertIdempotencyKey = (idempotencyKey: string) => {
  if (idempotencyKey.trim()) return;

  throw new AppError({
    code: 'EMAIL_IDEMPOTENCY_KEY_REQUIRED',
    category: 'system',
    status: 500,
    message: 'Email sends require a non-empty idempotency key',
  });
};

const providerErrorMetadata = (error: {
  name?: string;
  statusCode?: number | null;
  message?: string;
}): EmailMetadata => ({
  providerError: {
    name: error.name,
    statusCode: error.statusCode,
    message: error.message,
  },
});

export class EmailGatewayResend implements EmailGateway {
  private readonly resend?: Resend;
  private readonly statusRepository: EmailStatusRepository;

  constructor(deps: EmailGatewayResendDeps) {
    this.resend = deps.resend;
    this.statusRepository = deps.statusRepository;
  }

  async sendEmail(input: SendEmailParams): Promise<SendEmailResult> {
    assertIdempotencyKey(input.idempotencyKey);

    if (envClient.VITE_IS_DEMO) {
      return {
        provider: EMAIL_PROVIDER_RESEND,
        skipped: true,
      };
    }

    const emailConfig = getEmailConfig();
    if (emailConfig.deliveryDisabled) {
      return {
        provider: EMAIL_PROVIDER_RESEND,
        skipped: true,
      };
    }

    const recipient = recipientToStatusValue(input.to);
    const attempt = await this.statusRepository.recordSendAttempt({
      provider: EMAIL_PROVIDER_RESEND,
      recipient,
      subject: input.subject,
      idempotencyKey: input.idempotencyKey,
      metadata: input.metadata,
    });

    if (attempt.externalId) {
      return {
        provider: EMAIL_PROVIDER_RESEND,
        externalId: attempt.externalId,
        skipped: false,
      };
    }

    const text = await render(input.template as ReactElement, {
      plainText: true,
    });

    const payload: CreateEmailOptions = {
      from: emailConfig.from,
      to: input.to,
      subject: input.subject,
      react: input.template as ReactElement,
      text,
      ...(input.cc ? { cc: input.cc } : {}),
      ...(input.bcc ? { bcc: input.bcc } : {}),
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
      ...(input.headers ? { headers: input.headers } : {}),
      ...(input.attachments
        ? {
            attachments: input.attachments as CreateEmailOptions['attachments'],
          }
        : {}),
      ...(input.tags ? { tags: input.tags } : {}),
    };

    const resend = this.resend ?? getDefaultResendClient();
    const { data, error } = await resend.emails.send(payload, {
      idempotencyKey: input.idempotencyKey,
    });

    if (error) {
      const failedAttempt = await this.statusRepository.recordSendAttempt({
        provider: EMAIL_PROVIDER_RESEND,
        recipient,
        subject: input.subject,
        idempotencyKey: input.idempotencyKey,
        status: 'send_failed',
        metadata: {
          ...input.metadata,
          ...providerErrorMetadata(error),
        },
      });

      if (failedAttempt.externalId) {
        return {
          provider: EMAIL_PROVIDER_RESEND,
          externalId: failedAttempt.externalId,
          skipped: false,
        };
      }

      throw new AppError({
        code: 'EMAIL_SEND_FAILED',
        category: 'system',
        status: error.statusCode ?? 500,
        message: 'Failed to send email',
        details: {
          provider: EMAIL_PROVIDER_RESEND,
          errorName: error.name,
          statusCode: error.statusCode,
        },
        cause: error,
      });
    }

    if (!data?.id) {
      const failedAttempt = await this.statusRepository.recordSendAttempt({
        provider: EMAIL_PROVIDER_RESEND,
        recipient,
        subject: input.subject,
        idempotencyKey: input.idempotencyKey,
        status: 'send_failed',
        metadata: input.metadata,
      });

      if (failedAttempt.externalId) {
        return {
          provider: EMAIL_PROVIDER_RESEND,
          externalId: failedAttempt.externalId,
          skipped: false,
        };
      }

      throw new AppError({
        code: 'EMAIL_SEND_EMPTY_RESULT',
        category: 'system',
        status: 500,
        message: 'Email provider returned no external ID',
      });
    }

    await this.statusRepository.upsertStatusByExternalId({
      provider: EMAIL_PROVIDER_RESEND,
      externalId: data.id,
      recipient,
      subject: input.subject,
      status: 'sent',
      idempotencyKey: input.idempotencyKey,
      metadata: input.metadata,
    });

    return {
      provider: EMAIL_PROVIDER_RESEND,
      externalId: data.id,
      skipped: false,
    };
  }
}
