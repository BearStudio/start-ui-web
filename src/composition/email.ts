import {
  createEmailUseCases,
  type EmailGateway,
  type EmailStatusRepository,
  type EmailUseCases,
} from '@/modules/email';
import { EmailStatusRepositoryDrizzle } from '@/modules/email/infrastructure/drizzle/email-status-repository-drizzle';
import { EmailGatewayResend } from '@/modules/email/infrastructure/resend/email-gateway-resend';
import { ResendWebhookVerifier } from '@/modules/email/infrastructure/resend/resend-webhook-verifier';
import {
  type Database,
  getDefaultDbClient,
} from '@/modules/kernel/infrastructure/db/client';

import { createCachedFactory } from './shared/singleton';

export type EmailOverrides = {
  db?: Database;
  emailGateway?: EmailGateway;
  emailStatusRepository?: EmailStatusRepository;
  resendWebhookVerifier?: ResendWebhookVerifier;
};

type EmailServices = {
  gateway: EmailGateway;
  useCases: EmailUseCases;
  resendWebhookVerifier: ResendWebhookVerifier;
};

const buildEmailServices = (overrides?: EmailOverrides): EmailServices => {
  const db = overrides?.db ?? getDefaultDbClient();
  const emailStatusRepository =
    overrides?.emailStatusRepository ?? new EmailStatusRepositoryDrizzle(db);

  const gateway =
    overrides?.emailGateway ??
    new EmailGatewayResend({
      statusRepository: emailStatusRepository,
    });

  return {
    gateway,
    useCases: createEmailUseCases({
      emailStatusRepository,
    }),
    resendWebhookVerifier:
      overrides?.resendWebhookVerifier ?? new ResendWebhookVerifier(),
  };
};

const factory = createCachedFactory<EmailServices, EmailOverrides>(
  buildEmailServices
);

export const getEmailServices = (overrides?: EmailOverrides) =>
  factory.get(overrides);

export const getEmailGateway = (overrides?: EmailOverrides) =>
  getEmailServices(overrides).gateway;

export const getEmailUseCases = (overrides?: EmailOverrides) =>
  getEmailServices(overrides).useCases;

export const getResendWebhookVerifier = (overrides?: EmailOverrides) =>
  getEmailServices(overrides).resendWebhookVerifier;

/** Test-only. */
export const __resetEmailComposition = () => factory.reset();
