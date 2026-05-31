import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';

import { createdAtColumn, idColumn, updatedAtColumn } from './common';

export const emailStatus = pgTable(
  'email_status',
  {
    id: idColumn(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    provider: text('provider').notNull(),
    externalId: text('externalId'),
    recipient: text('recipient').notNull(),
    subject: text('subject').notNull(),
    status: text('status').notNull(),
    idempotencyKey: text('idempotencyKey'),
    lastWebhookEventId: text('lastWebhookEventId'),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
  },
  (table) => [
    uniqueIndex('email_status_provider_external_id_key')
      .on(table.provider, table.externalId)
      .where(sql`${table.externalId} is not null`),
    uniqueIndex('email_status_provider_idempotency_key')
      .on(table.provider, table.idempotencyKey)
      .where(sql`${table.idempotencyKey} is not null`),
    index('email_status_status_idx').on(table.status),
    index('email_status_created_at_idx').on(table.createdAt),
  ]
);
