import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import {
  createdAtColumn,
  updatedAtColumn,
} from '@/modules/kernel/infrastructure/db/schema/common';

import { user } from '../better-auth/schema';

export const authProviderEnum = pgEnum('AuthProvider', [
  'better-auth',
  'workos',
]);

export const authIdentity = pgTable(
  'auth_identity',
  {
    provider: authProviderEnum('provider').notNull(),
    providerUserId: text('providerUserId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    primaryKey({
      columns: [table.provider, table.providerUserId],
      name: 'auth_identity_provider_provider_user_id_pk',
    }),
    index('auth_identity_user_id_idx').on(table.userId),
    uniqueIndex('auth_identity_provider_user_id_key').on(
      table.provider,
      table.userId
    ),
  ]
);
