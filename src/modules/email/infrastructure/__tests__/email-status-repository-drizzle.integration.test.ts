import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createEmailUseCases } from '@/modules/email';
import {
  emailStatus as emailStatusTable,
  type NewEmailStatus,
} from '@/modules/kernel/infrastructure/db/schema';
import { createPgliteTestDatabase } from '@/tests/server/pglite';

import { EmailStatusRepositoryDrizzle } from '../drizzle/email-status-repository-drizzle';

const makeEmailStatusRow = (
  overrides: Partial<NewEmailStatus> = {}
): NewEmailStatus => ({
  id: 'email-status-1',
  provider: 'resend',
  externalId: 'email_1',
  recipient: 'user@example.com',
  subject: 'Login code',
  status: 'sent',
  idempotencyKey: 'key-1',
  lastWebhookEventId: null,
  metadata: {},
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

describe('EmailStatusRepositoryDrizzle integration', () => {
  let database: Awaited<ReturnType<typeof createPgliteTestDatabase>>;

  beforeAll(async () => {
    database = await createPgliteTestDatabase();
  });

  beforeEach(async () => {
    await database.truncate();
  });

  afterAll(async () => {
    await database?.close();
  });

  it('promotes a send attempt to the Resend external ID and counts final status', async () => {
    const repository = new EmailStatusRepositoryDrizzle(database.db);

    const attempt = await repository.recordSendAttempt({
      provider: 'resend',
      recipient: 'user@example.com',
      subject: 'Login code',
      idempotencyKey: 'key-1',
      metadata: { source: 'auth.signInOtp' },
    });

    expect(attempt).toMatchObject({
      provider: 'resend',
      externalId: null,
      status: 'send_attempted',
      idempotencyKey: 'key-1',
    });

    const sent = await repository.upsertStatusByExternalId({
      provider: 'resend',
      externalId: 'email_123',
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'sent',
      idempotencyKey: 'key-1',
      metadata: { external: true },
    });

    expect(sent).toMatchObject({
      id: attempt.id,
      externalId: 'email_123',
      status: 'sent',
      metadata: {
        source: 'auth.signInOtp',
        external: true,
      },
    });
    await expect(
      repository.getByExternalId('resend', 'email_123')
    ).resolves.toMatchObject({
      id: attempt.id,
      status: 'sent',
    });
    await expect(repository.countByStatus()).resolves.toEqual({ sent: 1 });
  });

  it('returns an existing sent record for repeated idempotency keys', async () => {
    const repository = new EmailStatusRepositoryDrizzle(database.db);

    const attempt = await repository.recordSendAttempt({
      provider: 'resend',
      recipient: 'user@example.com',
      subject: 'Login code',
      idempotencyKey: 'key-1',
      metadata: { source: 'auth.signInOtp' },
    });
    const sent = await repository.upsertStatusByExternalId({
      provider: 'resend',
      externalId: 'email_123',
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'sent',
      idempotencyKey: 'key-1',
    });

    const duplicate = await repository.recordSendAttempt({
      provider: 'resend',
      recipient: 'other@example.com',
      subject: 'Retry login code',
      idempotencyKey: 'key-1',
    });

    expect(duplicate).toMatchObject({
      id: sent.id,
      idempotencyKey: 'key-1',
      externalId: 'email_123',
      status: 'sent',
    });
    expect(sent.id).toBe(attempt.id);
    await expect(repository.listRecent()).resolves.toHaveLength(1);
  });

  it('preserves an existing idempotency key during webhook status updates', async () => {
    const repository = new EmailStatusRepositoryDrizzle(database.db);

    await repository.upsertStatusByExternalId({
      provider: 'resend',
      externalId: 'email_123',
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'sent',
      idempotencyKey: 'key-1',
    });

    const delivered = await repository.upsertStatusByExternalId({
      provider: 'resend',
      externalId: 'email_123',
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'delivered',
      idempotencyKey: null,
      lastWebhookEventId: 'evt_1',
    });

    expect(delivered).toMatchObject({
      externalId: 'email_123',
      status: 'delivered',
      idempotencyKey: 'key-1',
      lastWebhookEventId: 'evt_1',
    });
  });

  it('enforces provider idempotency key uniqueness in the database', async () => {
    await database.db.insert(emailStatusTable).values(
      makeEmailStatusRow({
        id: 'email-status-1',
        externalId: null,
        idempotencyKey: 'key-1',
      })
    );

    await expect(
      database.db.insert(emailStatusTable).values(
        makeEmailStatusRow({
          id: 'email-status-2',
          externalId: null,
          idempotencyKey: 'key-1',
        })
      )
    ).rejects.toThrow();
  });

  it('lists recent statuses newest first', async () => {
    const repository = new EmailStatusRepositoryDrizzle(database.db);
    await database.db.insert(emailStatusTable).values([
      makeEmailStatusRow({
        id: 'email-status-old',
        externalId: 'email_old',
        idempotencyKey: 'key-old',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
      makeEmailStatusRow({
        id: 'email-status-new',
        externalId: 'email_new',
        idempotencyKey: 'key-new',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      }),
    ]);

    const rows = await repository.listRecent({ limit: 1 });

    expect(rows.map((row) => row.id)).toEqual(['email-status-new']);
  });

  it('rejects invalid persisted metadata instead of replacing it with an empty object', async () => {
    const repository = new EmailStatusRepositoryDrizzle(database.db);
    await database.db.insert(emailStatusTable).values(
      makeEmailStatusRow({
        metadata: [] as unknown as Record<string, unknown>,
      })
    );

    await expect(
      repository.getByExternalId('resend', 'email_1')
    ).rejects.toMatchObject({
      code: 'EMAIL_STATUS_METADATA_INVALID',
    });
  });

  it('uses empty metadata for invalid persisted metadata in recent list reads', async () => {
    const repository = new EmailStatusRepositoryDrizzle(database.db);
    await database.db.insert(emailStatusTable).values(
      makeEmailStatusRow({
        metadata: [] as unknown as Record<string, unknown>,
      })
    );

    await expect(repository.listRecent()).resolves.toMatchObject([
      {
        id: 'email-status-1',
        metadata: {},
      },
    ]);
  });

  it('dedupes webhook event IDs and keeps bounded metadata through the use case', async () => {
    const repository = new EmailStatusRepositoryDrizzle(database.db);
    const useCases = createEmailUseCases({
      emailStatusRepository: repository,
      transactionRunner: {
        run: (work) =>
          database.db.transaction((tx) =>
            work({
              emailStatusRepository: new EmailStatusRepositoryDrizzle(tx),
            })
          ),
      },
    });

    const input = {
      provider: 'resend' as const,
      externalId: 'email_123',
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'delivered' as const,
      webhookEventId: 'evt_1',
      providerEventType: 'email.delivered',
      providerEventCreatedAt: '2026-01-01T00:00:00.000Z',
      metadata: { source: 'webhook' },
    };

    await expect(useCases.processStatusEvent(input)).resolves.toMatchObject({
      duplicate: false,
      record: {
        externalId: 'email_123',
        status: 'delivered',
      },
    });
    await expect(useCases.processStatusEvent(input)).resolves.toMatchObject({
      duplicate: true,
      record: {
        externalId: 'email_123',
        status: 'delivered',
      },
    });
    await expect(
      useCases.processStatusEvent({
        ...input,
        status: 'opened',
        webhookEventId: 'evt_2',
        providerEventType: 'email.opened',
      })
    ).resolves.toMatchObject({
      duplicate: false,
      record: {
        status: 'opened',
        lastWebhookEventId: 'evt_2',
        metadata: {
          processedWebhookEventIds: ['evt_1', 'evt_2'],
        },
      },
    });
  });
});
