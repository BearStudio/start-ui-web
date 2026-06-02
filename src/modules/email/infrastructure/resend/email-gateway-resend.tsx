import { render } from '@react-email/render';
import { Result } from '@swan-io/boxed';
import type { ReactElement } from 'react';
import type { CreateEmailOptions, Resend } from 'resend';

import {
  EMAIL_PROVIDER_RESEND,
  type EmailGateway,
  type EmailMetadata,
  type EmailTransactionContext,
  type RecordEmailSendAttemptInput,
  type SendEmailParams,
  type UpsertEmailStatusInput,
} from '@/modules/email';
import type { TransactionRunner } from '@/modules/kernel';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import {
  toEmailProviderMessageId,
  toEmailRecipientList,
} from '@/modules/kernel/domain/ids';
import { getEmailConfig } from '@/modules/kernel/infrastructure/config/email';
import { envClient } from '@/platform/env/client';

import { getDefaultResendClient } from './resend-client';

type EmailGatewayResendDeps = {
  statusTransactionRunner: TransactionRunner<EmailTransactionContext>;
  resend?: Resend;
};

type SendEmailResult = Awaited<ReturnType<EmailGateway['sendEmail']>>;

const recipientToStatusValue = (recipient: SendEmailParams['to']) =>
  toEmailRecipientList(
    Array.isArray(recipient) ? recipient.join(', ') : recipient
  );

const idempotencyKeyError = () =>
  new AppError({
    code: 'EMAIL_IDEMPOTENCY_KEY_REQUIRED',
    category: 'system',
    status: 500,
    message: 'Email sends require a non-empty idempotency key',
  });

const providerErrorMetadata = (error: unknown): EmailMetadata => {
  const errorRecord =
    error && typeof error === 'object'
      ? (error as {
          name?: unknown;
          statusCode?: unknown;
          message?: unknown;
        })
      : {};
  const providerError: EmailMetadata = {
    provider: EMAIL_PROVIDER_RESEND,
  };
  if (typeof errorRecord.name === 'string') {
    providerError.name = errorRecord.name;
  }
  if (
    typeof errorRecord.statusCode === 'number' ||
    errorRecord.statusCode === null
  ) {
    providerError.statusCode = errorRecord.statusCode;
  }
  if (typeof errorRecord.message === 'string') {
    providerError.message = errorRecord.message;
  } else if (error instanceof Error) {
    providerError.message = error.message;
  }

  return {
    providerError,
  };
};

export class EmailGatewayResend implements EmailGateway {
  private readonly resend?: Resend;
  private readonly statusTransactionRunner: TransactionRunner<EmailTransactionContext>;

  constructor(deps: EmailGatewayResendDeps) {
    this.resend = deps.resend;
    this.statusTransactionRunner = deps.statusTransactionRunner;
  }

  private recordSendAttempt(input: RecordEmailSendAttemptInput) {
    return this.statusTransactionRunner.run(({ emailStatusRepository }) =>
      emailStatusRepository.recordSendAttempt(input)
    );
  }

  private upsertStatusByExternalId(input: UpsertEmailStatusInput) {
    return this.statusTransactionRunner.run(({ emailStatusRepository }) =>
      emailStatusRepository.upsertStatusByExternalId(input)
    );
  }

  async sendEmail(
    input: SendEmailParams
  ): ReturnType<EmailGateway['sendEmail']> {
    if (!input.idempotencyKey.trim()) {
      return Result.Error(idempotencyKeyError());
    }

    if (envClient.VITE_IS_DEMO) {
      return Result.Ok({
        type: 'email_send_skipped',
        provider: EMAIL_PROVIDER_RESEND,
      });
    }

    const emailConfig = getEmailConfig();
    if (emailConfig.deliveryDisabled) {
      return Result.Ok({
        type: 'email_send_skipped',
        provider: EMAIL_PROVIDER_RESEND,
      });
    }

    const recipient = recipientToStatusValue(input.to);
    const attemptResult = await this.recordSendAttempt({
      provider: EMAIL_PROVIDER_RESEND,
      recipient,
      subject: input.subject,
      idempotencyKey: input.idempotencyKey,
      metadata: input.metadata,
    });
    if (attemptResult.isError()) return Result.Error(attemptResult.getError());

    const attempt = attemptResult.get().record;
    if (attempt.externalId) {
      return Result.Ok({
        type: 'email_send_recorded',
        provider: EMAIL_PROVIDER_RESEND,
        externalId: attempt.externalId,
      });
    }

    const recordFailedAttempt = async (
      metadata?: EmailMetadata
    ): Promise<SendEmailResult | null> => {
      const failedAttemptResult = await this.recordSendAttempt({
        provider: EMAIL_PROVIDER_RESEND,
        recipient,
        subject: input.subject,
        idempotencyKey: input.idempotencyKey,
        status: 'send_failed',
        metadata: {
          ...input.metadata,
          ...metadata,
        },
      });
      if (failedAttemptResult.isError()) {
        return Result.Error(failedAttemptResult.getError());
      }

      const failedAttempt = failedAttemptResult.get().record;
      if (failedAttempt.externalId) {
        return Result.Ok({
          type: 'email_send_recorded',
          provider: EMAIL_PROVIDER_RESEND,
          externalId: failedAttempt.externalId,
        });
      }

      return null;
    };

    const textResult = await Result.fromPromise(
      render(input.template as ReactElement, {
        plainText: true,
      })
    );
    if (textResult.isError()) {
      const failedAttempt = await recordFailedAttempt(
        providerErrorMetadata(textResult.getError())
      );
      if (failedAttempt) return failedAttempt;

      return Result.Error(
        new AppError({
          code: 'EMAIL_RENDER_FAILED',
          category: 'system',
          status: 500,
          message: 'Failed to render email',
          cause: textResult.getError(),
        })
      );
    }

    const payload: CreateEmailOptions = {
      from: emailConfig.from,
      to: input.to,
      subject: input.subject,
      react: input.template as ReactElement,
      text: textResult.get(),
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
    const responseResult = await Result.fromPromise(
      resend.emails.send(payload, {
        idempotencyKey: input.idempotencyKey,
      })
    );
    if (responseResult.isError()) {
      const failedAttempt = await recordFailedAttempt(
        providerErrorMetadata(responseResult.getError())
      );
      if (failedAttempt) return failedAttempt;

      return Result.Error(
        new AppError({
          code: 'EMAIL_SEND_FAILED',
          category: 'system',
          status: 500,
          message: 'Failed to send email',
          cause: responseResult.getError(),
        })
      );
    }

    const { data, error } = responseResult.get();

    if (error) {
      const failedAttempt = await recordFailedAttempt(
        providerErrorMetadata(error)
      );
      if (failedAttempt) return failedAttempt;

      return Result.Error(
        new AppError({
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
        })
      );
    }

    if (!data?.id) {
      const failedAttempt = await recordFailedAttempt();
      if (failedAttempt) return failedAttempt;

      return Result.Error(
        new AppError({
          code: 'EMAIL_SEND_EMPTY_RESULT',
          category: 'system',
          status: 500,
          message: 'Email provider returned no external ID',
        })
      );
    }

    const externalId = toEmailProviderMessageId(data.id);
    const upsertResult = await this.upsertStatusByExternalId({
      provider: EMAIL_PROVIDER_RESEND,
      externalId,
      recipient,
      subject: input.subject,
      status: 'sent',
      idempotencyKey: input.idempotencyKey,
      metadata: input.metadata,
    });
    if (upsertResult.isError()) return Result.Error(upsertResult.getError());

    return Result.Ok({
      type: 'email_send_recorded',
      provider: EMAIL_PROVIDER_RESEND,
      externalId,
    });
  }
}
