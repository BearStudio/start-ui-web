import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const genre = pgTable('genre', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
  name: varchar('name', { length: 255 }).notNull().unique(),
  color: varchar('color', { length: 255 }).notNull(),
});

export const book = pgTable('book', {
  id: varchar('id').primaryKey().$defaultFn(createId),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  publisher: varchar('publisher', { length: 255 }),
  genreId: varchar('genre_id')
    .notNull()
    .references(() => genre.id),
});

export const bookRelations = relations(book, ({ one }) => ({
  genre: one(genre, {
    fields: [book.genreId],
    references: [genre.id],
  }),
}));
