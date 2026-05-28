import { and, desc, eq, isNull, sql } from 'drizzle-orm';

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
import type { Database } from '@/modules/kernel/infrastructure/db/client';
import {
  emailStatus as emailStatusTable,
  type NewEmailStatus,
} from '@/modules/kernel/infrastructure/db/schema';

type EmailStatusRow = typeof emailStatusTable.$inferSelect;

const toMetadata = (metadata: unknown): EmailMetadata => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }
  return metadata as EmailMetadata;
};

const mergeMetadata = (
  current: unknown,
  incoming?: EmailMetadata
): EmailMetadata => ({
  ...toMetadata(current),
  ...incoming,
});

const toDomain = (row: EmailStatusRow): EmailStatusRecord => ({
  id: row.id,
  provider: row.provider as EmailProvider,
  externalId: row.externalId,
  recipient: row.recipient,
  subject: row.subject,
  status: row.status as EmailStatus,
  idempotencyKey: row.idempotencyKey,
  lastWebhookEventId: row.lastWebhookEventId,
  metadata: toMetadata(row.metadata),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

function mapDbError(error: unknown): never {
  if (error instanceof AppError) throw error;

  throw new AppError({
    code: 'EMAIL_STATUS_REPOSITORY_ERROR',
    category: 'system',
    status: 500,
    message: 'Email status repository error',
    cause: error,
  });
}

export class EmailStatusRepositoryDrizzle implements EmailStatusRepository {
  constructor(private readonly db: Database) {}

  async recordSendAttempt(
    input: RecordEmailSendAttemptInput
  ): Promise<EmailStatusRecord> {
    try {
      const existingAttempt = await this.db.query.emailStatus.findFirst({
        where: and(
          eq(emailStatusTable.provider, input.provider),
          eq(emailStatusTable.idempotencyKey, input.idempotencyKey),
          isNull(emailStatusTable.externalId)
        ),
        orderBy: [desc(emailStatusTable.createdAt)],
      });

      const values = {
        provider: input.provider,
        recipient: input.recipient,
        subject: input.subject,
        status: input.status ?? 'send_attempted',
        idempotencyKey: input.idempotencyKey,
        metadata: input.metadata ?? {},
      } satisfies NewEmailStatus;

      if (existingAttempt) {
        const [updated] = await this.db
          .update(emailStatusTable)
          .set({
            recipient: values.recipient,
            subject: values.subject,
            status: values.status,
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

      const [created] = await this.db
        .insert(emailStatusTable)
        .values(values)
        .returning();

      if (!created) {
        throw new AppError({
          code: 'EMAIL_STATUS_CREATE_EMPTY_RESULT',
          category: 'system',
          status: 500,
          message: 'Email status create returned no row',
        });
      }

      return toDomain(created);
    } catch (error) {
      mapDbError(error);
    }
  }

  async upsertStatusByExternalId(
    input: UpsertEmailStatusInput
  ): Promise<EmailStatusRecord> {
    try {
      const existing = await this.getByExternalId(
        input.provider,
        input.externalId
      );

      if (existing) {
        const [updated] = await this.db
          .update(emailStatusTable)
          .set({
            recipient: input.recipient,
            subject: input.subject,
            status: input.status,
            idempotencyKey:
              input.idempotencyKey === undefined
                ? existing.idempotencyKey
                : input.idempotencyKey,
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
        const existingAttempt = await this.db.query.emailStatus.findFirst({
          where: and(
            eq(emailStatusTable.provider, input.provider),
            eq(emailStatusTable.idempotencyKey, input.idempotencyKey),
            isNull(emailStatusTable.externalId)
          ),
          orderBy: [desc(emailStatusTable.createdAt)],
        });

        if (existingAttempt) {
          const [updated] = await this.db
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

      const [created] = await this.db
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
          set: {
            recipient: input.recipient,
            subject: input.subject,
            status: input.status,
            idempotencyKey: input.idempotencyKey ?? null,
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
    } catch (error) {
      mapDbError(error);
    }
  }

  async getByExternalId(
    provider: EmailProvider,
    externalId: string
  ): Promise<EmailStatusRecord | null> {
    try {
      const row = await this.db.query.emailStatus.findFirst({
        where: and(
          eq(emailStatusTable.provider, provider),
          eq(emailStatusTable.externalId, externalId)
        ),
      });

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

      return rows.map(toDomain);
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
