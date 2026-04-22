import { sql } from 'drizzle-orm';
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

export const userRoleEnum = pgEnum('UserRole', ['user', 'admin']);

const timestamps = {
  createdAt: timestamp('createdAt', { precision: 3 })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3 })
    .$onUpdateFn(() => new Date())
    .notNull(),
};

export const users = pgTable(
  'user',
  {
    id: text('id').primaryKey().notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    ...timestamps,
    role: userRoleEnum('role'),
    banned: boolean('banned'),
    banReason: text('banReason'),
    banExpires: timestamp('banExpires', { precision: 3 }),
    onboardedAt: timestamp('onboardedAt', { precision: 3 }),
  },
  (table) => [uniqueIndex('user_email_key').on(table.email)]
);

export const sessions = pgTable(
  'session',
  {
    id: text('id').primaryKey().notNull(),
    expiresAt: timestamp('expiresAt', { precision: 3 }).notNull(),
    token: text('token').notNull(),
    ...timestamps,
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    impersonatedBy: text('impersonatedBy'),
  },
  (table) => [uniqueIndex('session_token_key').on(table.token)]
);

export const accounts = pgTable('account', {
  id: text('id').primaryKey().notNull(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { precision: 3 }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { precision: 3 }),
  scope: text('scope'),
  password: text('password'),
  ...timestamps,
});

export const verifications = pgTable('verification', {
  id: text('id').primaryKey().notNull(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { precision: 3 }).notNull(),
  createdAt: timestamp('createdAt', { precision: 3 }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: timestamp('updatedAt', { precision: 3 }).$onUpdateFn(
    () => new Date()
  ),
});

export const genres = pgTable(
  'genre',
  {
    id: text('id').primaryKey().notNull(),
    ...timestamps,
    name: text('name').notNull(),
    color: text('color').notNull(),
  },
  (table) => [uniqueIndex('genre_name_key').on(table.name)]
);

export const books = pgTable(
  'book',
  {
    id: text('id').primaryKey().notNull(),
    ...timestamps,
    title: text('title').notNull(),
    author: text('author').notNull(),
    genreId: text('genreId')
      .notNull()
      .references(() => genres.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    publisher: text('publisher'),
    coverId: text('coverId'),
  },
  (table) => [
    uniqueIndex('book_title_author_key').on(table.title, table.author),
  ]
);

export const authors = pgTable(
  'author',
  {
    id: text('id').primaryKey().notNull(),
    ...timestamps,
    name: text('name').notNull(),
  },
  (table) => [uniqueIndex('author_name_key').on(table.name)]
);

export const publishers = pgTable(
  'publisher',
  {
    id: text('id').primaryKey().notNull(),
    ...timestamps,
    name: text('name').notNull(),
  },
  (table) => [uniqueIndex('publisher_name_key').on(table.name)]
);

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const genreRelations = relations(genres, ({ many }) => ({
  books: many(books),
}));

export const bookRelations = relations(books, ({ one }) => ({
  genre: one(genres, {
    fields: [books.genreId],
    references: [genres.id],
  }),
}));

export const schema = {
  accounts,
  accountRelations,
  authors,
  books,
  bookRelations,
  genres,
  genreRelations,
  publishers,
  sessions,
  sessionRelations,
  userRoleEnum,
  users,
  userRelations,
  verifications,
};

export type UserRole = (typeof userRoleEnum.enumValues)[number];
