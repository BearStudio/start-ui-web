import type { WebhookEventPayload } from 'resend';
import type { Resend } from 'resend';

import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { getEmailConfig } from '@/modules/kernel/infrastructure/config/email';

import { getDefaultResendClient } from './resend-client';

export type VerifyResendWebhookInput = {
  payload: string;
  headers: {
    id: string;
    timestamp: string;
    signature: string;
  };
};

export class ResendWebhookVerifier {
  constructor(private readonly resend?: Resend) {}

  verify(input: VerifyResendWebhookInput): WebhookEventPayload {
    const webhookSecret = getEmailConfig().resendWebhookSecret;
    if (!webhookSecret) {
      throw new AppError({
        code: 'EMAIL_WEBHOOK_SECRET_NOT_CONFIGURED',
        category: 'system',
        status: 500,
        message: 'Resend webhook secret is not configured',
      });
    }

    try {
      const resend = this.resend ?? getDefaultResendClient();
      return resend.webhooks.verify({
        payload: input.payload,
        headers: input.headers,
        webhookSecret,
      });
    } catch (error) {
      throw new AppError({
        code: 'EMAIL_WEBHOOK_INVALID_SIGNATURE',
        category: 'bad_request',
        status: 400,
        message: 'Invalid email webhook signature',
        cause: error,
      });
    }
  }
}
