import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import {
  createdAtColumn,
  idColumn,
  updatedAtColumn,
} from '@/modules/kernel/infrastructure/db/schema/common';

export const userRoleEnum = pgEnum('UserRole', ['user', 'admin']);

// Better Auth owns the core auth table shape. App-owned profile fields remain
// here until they are migrated behind a provider-neutral user profile table.
export const user = pgTable(
  'user',
  {
    id: idColumn(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),

    role: userRoleEnum('role').default('user').notNull(),
    banned: boolean('banned'),
    banReason: text('banReason'),
    banExpires: timestamp('banExpires', { precision: 3, mode: 'date' }),
    onboardedAt: timestamp('onboardedAt', { precision: 3, mode: 'date' }),
  },
  (table) => [uniqueIndex('user_email_key').on(table.email)]
);

export const session = pgTable(
  'session',
  {
    id: idColumn(),
    expiresAt: timestamp('expiresAt', { precision: 3, mode: 'date' }).notNull(),
    token: text('token').notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    impersonatedBy: text('impersonatedBy'),
  },
  (table) => [
    uniqueIndex('session_token_key').on(table.token),
    index('session_user_id_idx').on(table.userId),
  ]
);

export const account = pgTable(
  'account',
  {
    id: idColumn(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt', {
      precision: 3,
      mode: 'date',
    }),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', {
      precision: 3,
      mode: 'date',
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index('account_user_id_idx').on(table.userId),
    uniqueIndex('account_provider_account_key').on(
      table.providerId,
      table.accountId
    ),
  ]
);

export const verification = pgTable(
  'verification',
  {
    id: idColumn(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt', { precision: 3, mode: 'date' }).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex('verification_identifier_value_key').on(
      table.identifier,
      table.value
    ),
  ]
);
