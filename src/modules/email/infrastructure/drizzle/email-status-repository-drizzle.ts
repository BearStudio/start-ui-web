import { Result, type Result as BoxedResult } from '@swan-io/boxed';
import { and, desc, eq, sql } from 'drizzle-orm';
import { pullObject } from 'remeda';
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
import type {
  EmailIdempotencyKey,
  EmailProviderMessageId,
} from '@/modules/kernel/domain/ids';
import {
  toEmailIdempotencyKey,
  toEmailProviderMessageId,
  toEmailRecipientList,
  toEmailStatusId,
  toEmailWebhookEventId,
} from '@/modules/kernel/domain/ids';
import {
  getConstraintName,
  isUniqueConstraintViolation,
} from '@/modules/kernel/infrastructure/db/errors';
import { observeRepository } from '@/modules/kernel/infrastructure/db/observability';
import {
  emailStatus as emailStatusTable,
  type NewEmailStatus,
} from '@/modules/kernel/infrastructure/db/schema';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';

type EmailStatusRow = typeof emailStatusTable.$inferSelect;

const emailMetadataSchema = z.record(z.string(), z.unknown());

const toMetadata = (
  metadata: unknown
): BoxedResult<EmailMetadata, AppError> => {
  const result = emailMetadataSchema.safeParse(metadata);

  if (!result.success) {
    return Result.Error(
      new AppError({
        code: 'EMAIL_STATUS_METADATA_INVALID',
        category: 'system',
        status: 500,
        message: 'Email status metadata is invalid',
        details: { issues: result.error.issues },
        cause: result.error,
      })
    );
  }

  return Result.Ok(result.data);
};

const toMetadataOrEmpty = (metadata: unknown): EmailMetadata => {
  const result = emailMetadataSchema.safeParse(metadata);

  return result.success ? result.data : {};
};

const mergeMetadata = (
  current: unknown,
  incoming?: EmailMetadata
): BoxedResult<EmailMetadata, AppError> => {
  const currentMetadata = toMetadata(current);
  if (currentMetadata.isError())
    return Result.Error(currentMetadata.getError());

  return Result.Ok({
    ...currentMetadata.get(),
    ...incoming,
  });
};

const toDomain = (
  row: EmailStatusRow,
  options?: { tolerateInvalidMetadata?: boolean }
): BoxedResult<EmailStatusRecord, AppError> => {
  const metadata = options?.tolerateInvalidMetadata
    ? Result.Ok(toMetadataOrEmpty(row.metadata))
    : toMetadata(row.metadata);
  if (metadata.isError()) return Result.Error(metadata.getError());

  return Result.Ok({
    id: toEmailStatusId(row.id),
    provider: row.provider as EmailProvider,
    externalId: row.externalId
      ? toEmailProviderMessageId(row.externalId)
      : null,
    recipient: toEmailRecipientList(row.recipient),
    subject: row.subject,
    status: row.status as EmailStatus,
    idempotencyKey: row.idempotencyKey
      ? toEmailIdempotencyKey(row.idempotencyKey)
      : null,
    lastWebhookEventId: row.lastWebhookEventId
      ? toEmailWebhookEventId(row.lastWebhookEventId)
      : null,
    metadata: metadata.get(),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
};

const emailStatusIdempotencyKeyIsNotNull = sql`${emailStatusTable.idempotencyKey} is not null`;
const emailStatusExternalIdIsNotNull = sql`${emailStatusTable.externalId} is not null`;

function mapDbError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isUniqueConstraintViolation(error)) {
    const constraint = getConstraintName(error);
    if (
      constraint === 'email_status_provider_external_id_key' ||
      constraint === 'email_status_provider_idempotency_key'
    ) {
      return new AppError({
        code: 'EMAIL_STATUS_DUPLICATE',
        category: 'conflict',
        status: 409,
        message: 'Email status already exists',
        cause: error,
      });
    }
  }

  return new AppError({
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
    idempotencyKey: EmailIdempotencyKey
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
    externalId: EmailProviderMessageId
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
  ): Promise<BoxedResult<EmailStatusRecord, AppError>> {
    const metadata = mergeMetadata(row.metadata, input.metadata);
    if (metadata.isError()) return Result.Error(metadata.getError());

    const [updated] = await db
      .update(emailStatusTable)
      .set({
        recipient: values.recipient,
        subject: values.subject,
        status: values.status,
        metadata: metadata.get(),
        updatedAt: new Date(),
      })
      .where(eq(emailStatusTable.id, row.id))
      .returning();

    if (!updated) {
      return Result.Error(
        new AppError({
          code: 'EMAIL_STATUS_UPDATE_EMPTY_RESULT',
          category: 'system',
          status: 500,
          message: 'Email status update returned no row',
        })
      );
    }

    return toDomain(updated);
  }

  private async recordSendAttemptWithDb(
    db: DbLike,
    input: RecordEmailSendAttemptInput
  ): Promise<BoxedResult<EmailStatusRecord, AppError>> {
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
      return Result.Error(
        new AppError({
          code: 'EMAIL_STATUS_CREATE_EMPTY_RESULT',
          category: 'system',
          status: 500,
          message: 'Email status create returned no row',
        })
      );
    }

    if (racedAttempt.externalId) return toDomain(racedAttempt);

    return this.updateSendAttempt(db, racedAttempt, input, values);
  }

  async recordSendAttempt(
    input: RecordEmailSendAttemptInput
  ): ReturnType<EmailStatusRepository['recordSendAttempt']> {
    try {
      const record = await this.recordSendAttemptWithDb(this.db, input);
      if (record.isError()) return Result.Error(mapDbError(record.getError()));

      return Result.Ok({ type: 'email_status_recorded', record: record.get() });
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }

  private async upsertStatusByExternalIdWithDb(
    db: DbLike,
    input: UpsertEmailStatusInput
  ): Promise<BoxedResult<EmailStatusRecord, AppError>> {
    const existingRow = await this.findByExternalId(
      db,
      input.provider,
      input.externalId
    );
    if (existingRow) {
      const existing = toDomain(existingRow);
      if (existing.isError()) return Result.Error(existing.getError());

      const existingRecord = existing.get();
      const metadata = mergeMetadata(existingRecord.metadata, input.metadata);
      if (metadata.isError()) return Result.Error(metadata.getError());

      const [updated] = await db
        .update(emailStatusTable)
        .set({
          recipient: input.recipient,
          subject: input.subject,
          status: input.status,
          lastWebhookEventId:
            input.lastWebhookEventId === undefined
              ? existingRecord.lastWebhookEventId
              : input.lastWebhookEventId,
          metadata: metadata.get(),
          updatedAt: new Date(),
        })
        .where(eq(emailStatusTable.id, existingRecord.id))
        .returning();

      if (!updated) {
        return Result.Error(
          new AppError({
            code: 'EMAIL_STATUS_UPDATE_EMPTY_RESULT',
            category: 'system',
            status: 500,
            message: 'Email status update returned no row',
          })
        );
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
        const metadata = mergeMetadata(
          existingAttempt.metadata,
          input.metadata
        );
        if (metadata.isError()) return Result.Error(metadata.getError());

        const [updated] = await db
          .update(emailStatusTable)
          .set({
            externalId: input.externalId,
            recipient: input.recipient,
            subject: input.subject,
            status: input.status,
            lastWebhookEventId: input.lastWebhookEventId ?? null,
            metadata: metadata.get(),
            updatedAt: new Date(),
          })
          .where(eq(emailStatusTable.id, existingAttempt.id))
          .returning();

        if (!updated) {
          return Result.Error(
            new AppError({
              code: 'EMAIL_STATUS_UPDATE_EMPTY_RESULT',
              category: 'system',
              status: 500,
              message: 'Email status update returned no row',
            })
          );
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
          lastWebhookEventId:
            input.lastWebhookEventId === undefined
              ? sql`${emailStatusTable.lastWebhookEventId}`
              : input.lastWebhookEventId,
          metadata: sql<EmailMetadata>`coalesce(${emailStatusTable.metadata}, '{}'::jsonb) || ${input.metadata ?? {}}::jsonb`,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!created) {
      return Result.Error(
        new AppError({
          code: 'EMAIL_STATUS_UPSERT_EMPTY_RESULT',
          category: 'system',
          status: 500,
          message: 'Email status upsert returned no row',
        })
      );
    }

    return toDomain(created);
  }

  async upsertStatusByExternalId(
    input: UpsertEmailStatusInput
  ): ReturnType<EmailStatusRepository['upsertStatusByExternalId']> {
    try {
      const record = await this.upsertStatusByExternalIdWithDb(this.db, input);
      if (record.isError()) return Result.Error(mapDbError(record.getError()));

      return Result.Ok({ type: 'email_status_recorded', record: record.get() });
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }

  async getByExternalId(
    provider: EmailProvider,
    externalId: EmailProviderMessageId
  ): ReturnType<EmailStatusRepository['getByExternalId']> {
    try {
      const row = await this.findByExternalId(this.db, provider, externalId);

      if (!row) return Result.Ok({ type: 'email_status_not_found' });

      const record = toDomain(row);
      if (record.isError()) return Result.Error(mapDbError(record.getError()));

      return Result.Ok({
        type: 'email_status_found',
        record: record.get(),
      });
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }

  async listRecent(input?: {
    limit?: number;
  }): ReturnType<EmailStatusRepository['listRecent']> {
    try {
      const rows = await this.db.query.emailStatus.findMany({
        orderBy: [desc(emailStatusTable.createdAt), desc(emailStatusTable.id)],
        limit: input?.limit ?? 20,
      });

      const records: EmailStatusRecord[] = [];
      for (const row of rows) {
        const record = toDomain(row, { tolerateInvalidMetadata: true });
        if (record.isError())
          return Result.Error(mapDbError(record.getError()));
        records.push(record.get());
      }

      return Result.Ok({
        type: 'email_status_recent_listed',
        records,
      });
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }

  async countByStatus(): ReturnType<EmailStatusRepository['countByStatus']> {
    try {
      const rows = await this.db
        .select({
          status: emailStatusTable.status,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(emailStatusTable)
        .groupBy(emailStatusTable.status);

      return Result.Ok({
        type: 'email_status_counted',
        counts: pullObject(
          rows,
          (row) => row.status as EmailStatus,
          (row) => row.count
        ),
      });
    } catch (error) {
      return Result.Error(mapDbError(error));
    }
  }
}

export interface EmailStatusRepositoryDrizzleDependencies {
  db: DbLike;
}

export function createEmailStatusRepository(
  dependencies: EmailStatusRepositoryDrizzleDependencies
): EmailStatusRepository {
  return observeRepository(
    new EmailStatusRepositoryDrizzle(dependencies.db),
    'email_status'
  );
}
