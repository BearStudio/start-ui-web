import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('UserRole', ['user', 'admin']);

export const user = pgTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    role: userRoleEnum('role'),
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
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    expiresAt: timestamp('expiresAt', { precision: 3, mode: 'date' }).notNull(),
    token: text('token').notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
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
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
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
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_user_id_idx').on(table.userId)]
);

export const verification = pgTable(
  'verification',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt', { precision: 3, mode: 'date' }).notNull(),
    createdAt: timestamp('createdAt', {
      precision: 3,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const genre = pgTable(
  'genre',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    name: text('name').notNull(),
    color: text('color').notNull(),
  },
  (table) => [uniqueIndex('genre_name_key').on(table.name)]
);

export const book = pgTable(
  'book',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    title: text('title').notNull(),
    author: text('author').notNull(),
    genreId: text('genreId')
      .notNull()
      .references(() => genre.id),
    publisher: text('publisher'),
    coverId: text('coverId'),
  },
  (table) => [
    uniqueIndex('book_title_author_key').on(table.title, table.author),
    index('book_genre_id_idx').on(table.genreId),
  ]
);

export const author = pgTable(
  'author',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    name: text('name').notNull(),
  },
  (table) => [uniqueIndex('author_name_key').on(table.name)]
);

export const publisher = pgTable(
  'publisher',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    name: text('name').notNull(),
  },
  (table) => [uniqueIndex('publisher_name_key').on(table.name)]
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const bookRelations = relations(book, ({ one }) => ({
  genre: one(genre, {
    fields: [book.genreId],
    references: [genre.id],
  }),
}));

export const genreRelations = relations(genre, ({ many }) => ({
  books: many(book),
}));

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
export type Book = typeof book.$inferSelect;
export type NewBook = typeof book.$inferInsert;
export type Genre = typeof genre.$inferSelect;
export type NewGenre = typeof genre.$inferInsert;
export type Author = typeof author.$inferSelect;
export type NewAuthor = typeof author.$inferInsert;
export type Publisher = typeof publisher.$inferSelect;
export type NewPublisher = typeof publisher.$inferInsert;
