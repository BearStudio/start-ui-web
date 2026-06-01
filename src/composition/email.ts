import {
  createEmailUseCases,
  type EmailGateway,
  type EmailStatusRepository,
  type EmailTransactionContext,
  type EmailUseCases,
} from '@/modules/email';
import { createEmailStatusRepository } from '@/modules/email/infrastructure/drizzle/email-status-repository-drizzle';
import { EmailGatewayResend } from '@/modules/email/infrastructure/resend/email-gateway-resend';
import { ResendWebhookVerifier } from '@/modules/email/infrastructure/resend/resend-webhook-verifier';
import type { TransactionRunner } from '@/modules/kernel';
import {
  createTransactionRunner,
  type Database,
  getDefaultDbClient,
} from '@/modules/kernel/infrastructure/db/client';

import type { Kernel } from './kernel';
import { createCachedFactory } from './shared/singleton';

type EmailKernel = Pick<Kernel, 'db' | 'transactionRunner'>;

export type EmailOverrides = {
  kernel?: EmailKernel;
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

const createEmailStatusTransactionRunner = (
  kernel: EmailKernel,
  emailStatusRepositoryOverride?: EmailStatusRepository
): TransactionRunner<EmailTransactionContext> => {
  if (emailStatusRepositoryOverride) {
    return {
      run: (work) =>
        work({ emailStatusRepository: emailStatusRepositoryOverride }),
    };
  }

  return {
    run: (work, options) =>
      kernel.transactionRunner.run(
        (db) =>
          work({
            emailStatusRepository: createEmailStatusRepository({ db }),
          }),
        options
      ),
  };
};

const createEmailKernel = (db: Database): EmailKernel => ({
  db,
  transactionRunner: createTransactionRunner(db),
});

const getDefaultEmailKernel = (): EmailKernel =>
  createEmailKernel(getDefaultDbClient());

const buildEmailServices = (overrides?: EmailOverrides): EmailServices => {
  const kernel =
    overrides?.kernel ??
    (overrides?.db ? createEmailKernel(overrides.db) : getDefaultEmailKernel());
  const emailStatusRepository =
    overrides?.emailStatusRepository ??
    createEmailStatusRepository({ db: kernel.db });
  const statusTransactionRunner = createEmailStatusTransactionRunner(
    kernel,
    overrides?.emailStatusRepository
  );

  const gateway =
    overrides?.emailGateway ??
    new EmailGatewayResend({
      statusTransactionRunner,
    });

  return {
    gateway,
    useCases: createEmailUseCases({
      emailStatusRepository,
      transactionRunner: statusTransactionRunner,
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
