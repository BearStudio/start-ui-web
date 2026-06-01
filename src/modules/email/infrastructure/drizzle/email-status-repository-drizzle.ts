import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import type {
  EmailMetadata,
  EmailProvider,
  EmailStatus,
  EmailStatusRecord,
} from '@/modules/email';
import type {
  EmailStatusRepository,
  RecordEmailSendAttemptInput,
  UpsertEmailStatusInput,
} from '@/modules/email';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import {
  getConstraintName,
  isUniqueConstraintViolation,
} from '@/modules/kernel/infrastructure/db/errors';
import {
  emailStatus as emailStatusTable,
  type NewEmailStatus,
} from '@/modules/kernel/infrastructure/db/schema';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';

type EmailStatusRow = typeof emailStatusTable.$inferSelect;

const emailMetadataSchema = z.record(z.string(), z.unknown());

const toMetadata = (metadata: unknown): EmailMetadata => {
  const result = emailMetadataSchema.safeParse(metadata);

  if (!result.success) {
    throw new AppError({
      code: 'EMAIL_STATUS_METADATA_INVALID',
      category: 'system',
      status: 500,
      message: 'Email status metadata is invalid',
      details: { issues: result.error.issues },
      cause: result.error,
    });
  }

  return result.data;
};

const toMetadataOrEmpty = (metadata: unknown): EmailMetadata => {
  const result = emailMetadataSchema.safeParse(metadata);

  return result.success ? result.data : {};
};

const mergeMetadata = (
  current: unknown,
  incoming?: EmailMetadata
): EmailMetadata => ({
  ...toMetadata(current),
  ...incoming,
});

const toDomain = (
  row: EmailStatusRow,
  options?: { tolerateInvalidMetadata?: boolean }
): EmailStatusRecord => ({
  id: row.id,
  provider: row.provider as EmailProvider,
  externalId: row.externalId,
  recipient: row.recipient,
  subject: row.subject,
  status: row.status as EmailStatus,
  idempotencyKey: row.idempotencyKey,
  lastWebhookEventId: row.lastWebhookEventId,
  metadata: options?.tolerateInvalidMetadata
    ? toMetadataOrEmpty(row.metadata)
    : toMetadata(row.metadata),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const emailStatusIdempotencyKeyIsNotNull = sql`${emailStatusTable.idempotencyKey} is not null`;
const emailStatusExternalIdIsNotNull = sql`${emailStatusTable.externalId} is not null`;

function mapDbError(error: unknown): never {
  if (error instanceof AppError) throw error;

  if (isUniqueConstraintViolation(error)) {
    const constraint = getConstraintName(error);
    if (
      constraint === 'email_status_provider_external_id_key' ||
      constraint === 'email_status_provider_idempotency_key'
    ) {
      throw new AppError({
        code: 'EMAIL_STATUS_DUPLICATE',
        category: 'conflict',
        status: 409,
        message: 'Email status already exists',
        cause: error,
      });
    }
  }

  throw new AppError({
    code: 'EMAIL_STATUS_REPOSITORY_ERROR',
    category: 'system',
    status: 500,
    message: 'Email status repository error',
    cause: error,
  });
}

export class EmailStatusRepositoryDrizzle implements EmailStatusRepository {
  constructor(private readonly db: DbLike) {}

  private findByIdempotencyKey(
    db: DbLike,
    provider: EmailProvider,
    idempotencyKey: string
  ) {
    return db.query.emailStatus.findFirst({
      where: and(
        eq(emailStatusTable.provider, provider),
        eq(emailStatusTable.idempotencyKey, idempotencyKey)
      ),
      orderBy: [desc(emailStatusTable.createdAt), desc(emailStatusTable.id)],
    });
  }

  private findByExternalId(
    db: DbLike,
    provider: EmailProvider,
    externalId: string
  ) {
    return db.query.emailStatus.findFirst({
      where: and(
        eq(emailStatusTable.provider, provider),
        eq(emailStatusTable.externalId, externalId)
      ),
    });
  }

  private async updateSendAttempt(
    db: DbLike,
    row: EmailStatusRow,
    input: RecordEmailSendAttemptInput,
    values: NewEmailStatus
  ) {
    const [updated] = await db
      .update(emailStatusTable)
      .set({
        recipient: values.recipient,
        subject: values.subject,
        status: values.status,
        metadata: mergeMetadata(row.metadata, input.metadata),
        updatedAt: new Date(),
      })
      .where(eq(emailStatusTable.id, row.id))
      .returning();

    if (!updated) {
      throw new AppError({
        code: 'EMAIL_STATUS_UPDATE_EMPTY_RESULT',
        category: 'system',
        status: 500,
        message: 'Email status update returned no row',
      });
    }

    return toDomain(updated);
  }

  private async recordSendAttemptWithDb(
    db: DbLike,
    input: RecordEmailSendAttemptInput
  ): Promise<EmailStatusRecord> {
    const existingAttempt = await this.findByIdempotencyKey(
      db,
      input.provider,
      input.idempotencyKey
    );

    const values = {
      provider: input.provider,
      recipient: input.recipient,
      subject: input.subject,
      status: input.status ?? 'send_attempted',
      idempotencyKey: input.idempotencyKey,
      metadata: input.metadata ?? {},
    } satisfies NewEmailStatus;

    if (existingAttempt) {
      if (existingAttempt.externalId) return toDomain(existingAttempt);

      return this.updateSendAttempt(db, existingAttempt, input, values);
    }

    const [created] = await db
      .insert(emailStatusTable)
      .values(values)
      .onConflictDoNothing({
        target: [emailStatusTable.provider, emailStatusTable.idempotencyKey],
        where: emailStatusIdempotencyKeyIsNotNull,
      })
      .returning();

    if (created) return toDomain(created);

    const racedAttempt = await this.findByIdempotencyKey(
      db,
      input.provider,
      input.idempotencyKey
    );

    if (!racedAttempt) {
      throw new AppError({
        code: 'EMAIL_STATUS_CREATE_EMPTY_RESULT',
        category: 'system',
        status: 500,
        message: 'Email status create returned no row',
      });
    }

    if (racedAttempt.externalId) return toDomain(racedAttempt);

    return this.updateSendAttempt(db, racedAttempt, input, values);
  }

  async recordSendAttempt(
    input: RecordEmailSendAttemptInput
  ): Promise<EmailStatusRecord> {
    try {
      return await this.recordSendAttemptWithDb(this.db, input);
    } catch (error) {
      mapDbError(error);
    }
  }

  private async upsertStatusByExternalIdWithDb(
    db: DbLike,
    input: UpsertEmailStatusInput
  ): Promise<EmailStatusRecord> {
    const existingRow = await this.findByExternalId(
      db,
      input.provider,
      input.externalId
    );
    const existing = existingRow ? toDomain(existingRow) : null;

    if (existing) {
      const [updated] = await db
        .update(emailStatusTable)
        .set({
          recipient: input.recipient,
          subject: input.subject,
          status: input.status,
          lastWebhookEventId:
            input.lastWebhookEventId === undefined
              ? existing.lastWebhookEventId
              : input.lastWebhookEventId,
          metadata: mergeMetadata(existing.metadata, input.metadata),
          updatedAt: new Date(),
        })
        .where(eq(emailStatusTable.id, existing.id))
        .returning();

      if (!updated) {
        throw new AppError({
          code: 'EMAIL_STATUS_UPDATE_EMPTY_RESULT',
          category: 'system',
          status: 500,
          message: 'Email status update returned no row',
        });
      }

      return toDomain(updated);
    }

    if (input.idempotencyKey) {
      const existingAttempt = await this.findByIdempotencyKey(
        db,
        input.provider,
        input.idempotencyKey
      );

      if (existingAttempt && !existingAttempt.externalId) {
        const [updated] = await db
          .update(emailStatusTable)
          .set({
            externalId: input.externalId,
            recipient: input.recipient,
            subject: input.subject,
            status: input.status,
            lastWebhookEventId: input.lastWebhookEventId ?? null,
            metadata: mergeMetadata(existingAttempt.metadata, input.metadata),
            updatedAt: new Date(),
          })
          .where(eq(emailStatusTable.id, existingAttempt.id))
          .returning();

        if (!updated) {
          throw new AppError({
            code: 'EMAIL_STATUS_UPDATE_EMPTY_RESULT',
            category: 'system',
            status: 500,
            message: 'Email status update returned no row',
          });
        }

        return toDomain(updated);
      }
    }

    const [created] = await db
      .insert(emailStatusTable)
      .values({
        provider: input.provider,
        externalId: input.externalId,
        recipient: input.recipient,
        subject: input.subject,
        status: input.status,
        idempotencyKey: input.idempotencyKey ?? null,
        lastWebhookEventId: input.lastWebhookEventId ?? null,
        metadata: input.metadata ?? {},
      })
      .onConflictDoUpdate({
        target: [emailStatusTable.provider, emailStatusTable.externalId],
        targetWhere: emailStatusExternalIdIsNotNull,
        set: {
          recipient: input.recipient,
          subject: input.subject,
          status: input.status,
          lastWebhookEventId: input.lastWebhookEventId ?? null,
          metadata: input.metadata ?? {},
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!created) {
      throw new AppError({
        code: 'EMAIL_STATUS_UPSERT_EMPTY_RESULT',
        category: 'system',
        status: 500,
        message: 'Email status upsert returned no row',
      });
    }

    return toDomain(created);
  }

  async upsertStatusByExternalId(
    input: UpsertEmailStatusInput
  ): Promise<EmailStatusRecord> {
    try {
      return await this.upsertStatusByExternalIdWithDb(this.db, input);
    } catch (error) {
      mapDbError(error);
    }
  }

  async getByExternalId(
    provider: EmailProvider,
    externalId: string
  ): Promise<EmailStatusRecord | null> {
    try {
      const row = await this.findByExternalId(this.db, provider, externalId);

      return row ? toDomain(row) : null;
    } catch (error) {
      mapDbError(error);
    }
  }

  async listRecent(input?: { limit?: number }): Promise<EmailStatusRecord[]> {
    try {
      const rows = await this.db.query.emailStatus.findMany({
        orderBy: [desc(emailStatusTable.createdAt), desc(emailStatusTable.id)],
        limit: input?.limit ?? 20,
      });

      return rows.map((row) =>
        toDomain(row, { tolerateInvalidMetadata: true })
      );
    } catch (error) {
      mapDbError(error);
    }
  }

  async countByStatus(): Promise<Partial<Record<EmailStatus, number>>> {
    try {
      const rows = await this.db
        .select({
          status: emailStatusTable.status,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(emailStatusTable)
        .groupBy(emailStatusTable.status);

      return Object.fromEntries(
        rows.map((row) => [row.status as EmailStatus, row.count])
      );
    } catch (error) {
      mapDbError(error);
    }
  }
}

export interface EmailStatusRepositoryDrizzleDependencies {
  db: DbLike;
}

export function createEmailStatusRepository(
  dependencies: EmailStatusRepositoryDrizzleDependencies
): EmailStatusRepository {
  return new EmailStatusRepositoryDrizzle(dependencies.db);
}
